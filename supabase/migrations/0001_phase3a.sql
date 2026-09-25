-- =====================================================================
-- TRỌN HIẾU · Phase 3a · Tài khoản thật + dữ liệu trên máy chủ
-- Chạy một lần trong Supabase → SQL Editor → New query → dán toàn bộ → Run.
-- Chạy lại được (dùng IF NOT EXISTS / OR REPLACE / DROP POLICY IF EXISTS).
--
-- Nguyên tắc:
--  • Mọi bảng bật RLS. Máy chủ kiểm tra quyền, không tin trình duyệt.
--  • Quyền dùng (gói Mở đầy đủ, đã trả tiền) chỉ đổi được qua hàm máy chủ — người dùng không tự sửa.
--  • Sổ phúng viếng và tài khoản bên nhận: chỉ người đại diện / người giữ Tài chính đọc được số tiền.
--  • Admin không đọc nội dung đám hiếu; chỉ tên và trạng thái qua admin_cases().
--  • Mọi người (kể cả Admin) đăng nhập bằng số điện thoại + mật khẩu. Admin = tài khoản thường được bật is_admin bằng lệnh ở cuối tệp.
-- =====================================================================


-- ---------- Hồ sơ người dùng ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null default '',
  phone text unique,
  email text,
  is_admin boolean not null default false,
  locked boolean not null default false,
  delete_requested_at timestamptz,
  support_note text,
  created_at timestamptz not null default now()
);

-- Tạo hồ sơ khi có tài khoản mới (tên, số điện thoại lấy từ lúc đăng ký)
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    case when new.email like '%@sdt.tronhieu.app' then null else new.email end
  )
  on conflict (id) do nothing;
  insert into public.audit_log (actor, action, target)
  values (coalesce(new.raw_user_meta_data->>'name', new.email), 'Đăng ký tài khoản', coalesce(new.raw_user_meta_data->>'phone', new.email));
  return new;
end $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin and not locked from public.profiles where id = auth.uid()), false)
$$;

create or replace function public.my_phone() returns text
language sql stable security definer set search_path = public as $$
  select phone from public.profiles where id = auth.uid()
$$;

-- ---------- Nhật ký (chỉ ghi thêm) ----------
create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor text not null,
  action text not null,
  target text not null default '',
  detail text
);

create or replace function public.log_audit(p_action text, p_target text, p_detail text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor, action, target, detail)
  values (coalesce((select name from public.profiles where id = auth.uid()), 'Hệ thống'), p_action, coalesce(p_target, ''), p_detail);
end $$;

-- Admin ghi nhật ký thao tác từ giao diện quản trị
create or replace function public.admin_log(p_action text, p_target text, p_detail text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  perform public.log_audit(p_action, p_target, p_detail);
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Đám hiếu ----------
create table if not exists public.cases (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  data jsonb not null,
  access jsonb not null default '{"plan":"free"}'::jsonb,
  version integer not null default 1,
  delete_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Thành viên (rút ra từ data.members để kiểm tra quyền nhanh)
create table if not exists public.case_members (
  case_id text not null references public.cases on delete cascade,
  member_id text not null,
  user_id uuid,
  phone text,
  access text not null,
  areas text[] not null default '{}',
  primary key (case_id, member_id)
);
create index if not exists case_members_phone on public.case_members (phone);
create index if not exists case_members_user on public.case_members (user_id);

create or replace function public.is_case_owner(cid text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.cases where id = cid and owner_id = auth.uid())
$$;

-- Thành viên có tài khoản (Đầy đủ / Giới hạn), nhận ra theo tài khoản hoặc số điện thoại được mời
create or replace function public.is_case_member(cid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_case_owner(cid) or exists (
    select 1 from public.case_members m
    where m.case_id = cid and m.access <> 'link'
      and (m.user_id = auth.uid() or (m.phone is not null and m.phone = public.my_phone()))
  )
$$;

-- Người xem được sổ phúng viếng và tài khoản bên nhận: người đại diện, người giữ “Toàn bộ” / “Tài chính”
create or replace function public.is_case_fin(cid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_case_owner(cid) or exists (
    select 1 from public.case_members m
    where m.case_id = cid and m.access <> 'link'
      and (m.user_id = auth.uid() or (m.phone is not null and m.phone = public.my_phone()))
      and (m.member_id = 'u1' or m.areas && array['Toàn bộ', 'Tài chính'])
  )
$$;

-- Giữ bảng thành viên khớp với data.members; chỉ người đại diện được sửa đội
create or replace function public.cases_before_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.owner_id <> old.owner_id then raise exception 'Không đổi được người đại diện qua đường này'; end if;
    if (new.data->'members') is distinct from (old.data->'members') and not public.is_case_owner(new.id) then
      raise exception 'Chỉ người đại diện gia đình sửa được đội';
    end if;
  end if;
  new.data := new.data - 'access' - 'ledger';
  new.updated_at := now();
  return new;
end $$;

create or replace function public.cases_after_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.case_members where case_id = new.id;
  insert into public.case_members (case_id, member_id, user_id, phone, access, areas)
  select new.id, m->>'id',
         case when m->>'id' = 'u1' then new.owner_id else nullif(m->>'userId', '')::uuid end,
         nullif(m->>'phone', ''), coalesce(m->>'access', 'limited'),
         coalesce(array(select jsonb_array_elements_text(m->'areas')), '{}')
  from jsonb_array_elements(coalesce(new.data->'members', '[]'::jsonb)) m
  where m->>'id' is not null;
  return null;
end $$;

drop trigger if exists cases_bw on public.cases;
create trigger cases_bw before insert or update on public.cases for each row execute function public.cases_before_write();
drop trigger if exists cases_aw on public.cases;
create trigger cases_aw after insert or update on public.cases for each row execute function public.cases_after_write();

-- ---------- Sổ phúng viếng ----------
create table if not exists public.condolences (
  id text primary key,
  case_id text not null references public.cases on delete cascade,
  info jsonb not null,          -- tên, nhóm, bạn của ai, lễ vật, người ghi, lúc ghi
  amount bigint not null default 0,
  method text not null default 'cash',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists condolences_case on public.condolences (case_id);

-- Mọi thành viên đọc được danh sách khách; số tiền chỉ người giữ Tài chính thấy
create or replace function public.case_ledger(cid text)
returns table (id text, info jsonb, amount bigint, method text)
language sql stable security definer set search_path = public as $$
  select c.id, c.info,
         case when public.is_case_fin(cid) then c.amount else null end,
         case when public.is_case_fin(cid) then c.method else null end
  from public.condolences c
  where c.case_id = cid and public.is_case_member(cid)
  order by c.created_at
$$;

-- ---------- Tài khoản bên nhận của khoản chi ----------
create table if not exists public.expense_payees (
  case_id text not null references public.cases on delete cascade,
  expense_id text not null,
  holder text not null,
  bank text not null,
  acct text not null,
  primary key (case_id, expense_id)
);

-- ---------- Trang thông tin công khai (cáo phó) ----------
create table if not exists public.public_pages (
  slug text primary key,
  case_id text not null unique references public.cases on delete cascade,
  content jsonb not null,
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- Danh bạ nhà cung cấp, gói & giá, cài đặt ----------
create table if not exists public.vendor_directory (
  id text primary key,
  data jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
insert into public.products (id, data) values
  ('full', '{"id":"full","name":"Mở đầy đủ đám hiếu","desc":"Đội (mời người, link), Nhà cung cấp, Tài chính, Khách viếng & cáo phó, Hậu tang & mốc tưởng niệm cho một đám hiếu","price":299000,"duration":"Đến hết giỗ đầu","active":true,"updatedAt":""}'),
  ('pre',  '{"id":"pre","name":"Chuẩn bị trước","desc":"Lưu giấy tờ, chia sẻ có kiểm soát, kích hoạt thành đám hiếu (đám hiếu được mở đầy đủ, không thu lần hai)","price":199000,"duration":"Đến khi kích hoạt","active":true,"updatedAt":""}')
on conflict (id) do nothing;

create table if not exists public.app_settings (
  id integer primary key default 1 check (id = 1),
  data jsonb not null
);
insert into public.app_settings (id, data) values (1,
  '{"sepay":{"env":"test","account":{"bank":"","number":"","holder":"","active":false},"matchRule":"Mã đơn trong nội dung + đúng số tiền + đúng tài khoản nhận"},"support":{"phone":"","zalo":""}}')
on conflict (id) do nothing;

-- ---------- Hồ sơ chuẩn bị ----------
create table if not exists public.pre_needs (
  id text primary key,
  owner_id uuid not null references auth.users on delete cascade,
  data jsonb not null,
  paid boolean not null default false,
  order_code text,
  case_id text,
  activated_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.pre_role(pid text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when p.owner_id = auth.uid() then 'owner'
    else (select s->>'role' from jsonb_array_elements(coalesce(p.data->'shares', '[]'::jsonb)) s
          where s->>'phone' = public.my_phone() limit 1)
  end
  from public.pre_needs p where p.id = pid
$$;

-- ---------- Đơn hàng & giao dịch ----------
create table if not exists public.orders (
  code text primary key,
  user_id uuid not null references auth.users on delete cascade,
  data jsonb not null,
  status text not null default 'pending',
  amount bigint not null,
  created_at timestamptz not null default now()
);

create table if not exists public.bank_txs (
  id text primary key,
  provider_tx_id text not null unique,
  data jsonb not null,
  status text not null,
  order_code text,
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Quyền truy cập (RLS)
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.audit_log enable row level security;
alter table public.cases enable row level security;
alter table public.case_members enable row level security;
alter table public.condolences enable row level security;
alter table public.expense_payees enable row level security;
alter table public.public_pages enable row level security;
alter table public.vendor_directory enable row level security;
alter table public.products enable row level security;
alter table public.app_settings enable row level security;
alter table public.pre_needs enable row level security;
alter table public.orders enable row level security;
alter table public.bank_txs enable row level security;

-- Chỉ cho sửa những cột an toàn; các cột quyền, trạng thái đổi qua hàm máy chủ
revoke insert, update, delete on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to authenticated;
grant select on public.products, public.public_pages to anon;
grant update (name, delete_requested_at) on public.profiles to authenticated;
grant insert (id, owner_id, data) on public.cases to authenticated;
grant update (data, version, delete_requested_at) on public.cases to authenticated;
grant insert (id, case_id, info, amount, method) on public.condolences to authenticated;
grant delete on public.condolences to authenticated;
grant insert, update (holder, bank, acct) on public.expense_payees to authenticated;
grant insert (slug, case_id, content, published), update (content, published, updated_at) on public.public_pages to authenticated;
grant insert (id, owner_id, data) on public.pre_needs to authenticated;
grant update (data) on public.pre_needs to authenticated;
grant usage, select on all sequences in schema public to authenticated;

drop policy if exists p_profiles_sel on public.profiles;
create policy p_profiles_sel on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists p_profiles_upd on public.profiles;
create policy p_profiles_upd on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists p_audit_sel on public.audit_log;
create policy p_audit_sel on public.audit_log for select using (public.is_admin());

drop policy if exists p_cases_sel on public.cases;
create policy p_cases_sel on public.cases for select using (public.is_case_member(id));
drop policy if exists p_cases_ins on public.cases;
create policy p_cases_ins on public.cases for insert with check (owner_id = auth.uid());
drop policy if exists p_cases_upd on public.cases;
create policy p_cases_upd on public.cases for update using (public.is_case_member(id)) with check (public.is_case_member(id));

drop policy if exists p_members_sel on public.case_members;
create policy p_members_sel on public.case_members for select using (public.is_case_member(case_id));

drop policy if exists p_cond_sel on public.condolences;
create policy p_cond_sel on public.condolences for select using (public.is_case_fin(case_id));
drop policy if exists p_cond_ins on public.condolences;
create policy p_cond_ins on public.condolences for insert with check (public.is_case_member(case_id));
drop policy if exists p_cond_del on public.condolences;
create policy p_cond_del on public.condolences for delete using (public.is_case_fin(case_id));

drop policy if exists p_payee_sel on public.expense_payees;
create policy p_payee_sel on public.expense_payees for select using (public.is_case_fin(case_id));
drop policy if exists p_payee_ins on public.expense_payees;
create policy p_payee_ins on public.expense_payees for insert with check (public.is_case_member(case_id));
drop policy if exists p_payee_upd on public.expense_payees;
create policy p_payee_upd on public.expense_payees for update using (public.is_case_fin(case_id));

drop policy if exists p_pages_sel on public.public_pages;
create policy p_pages_sel on public.public_pages for select using (published or public.is_case_member(case_id));
drop policy if exists p_pages_ins on public.public_pages;
create policy p_pages_ins on public.public_pages for insert with check (public.is_case_member(case_id));
drop policy if exists p_pages_upd on public.public_pages;
create policy p_pages_upd on public.public_pages for update using (public.is_case_member(case_id));

drop policy if exists p_dir_sel on public.vendor_directory;
create policy p_dir_sel on public.vendor_directory for select using (auth.uid() is not null);
drop policy if exists p_products_sel on public.products;
create policy p_products_sel on public.products for select using (true);
drop policy if exists p_settings_sel on public.app_settings;
create policy p_settings_sel on public.app_settings for select using (auth.uid() is not null);

drop policy if exists p_pre_sel on public.pre_needs;
create policy p_pre_sel on public.pre_needs for select using (public.pre_role(id) is not null or owner_id = auth.uid());
drop policy if exists p_pre_ins on public.pre_needs;
create policy p_pre_ins on public.pre_needs for insert with check (owner_id = auth.uid());
drop policy if exists p_pre_upd on public.pre_needs;
create policy p_pre_upd on public.pre_needs for update
  using (case_id is null and public.pre_role(id) in ('owner', 'edit', 'activate'))
  with check (case_id is null and public.pre_role(id) in ('owner', 'edit', 'activate'));

drop policy if exists p_orders_sel on public.orders;
create policy p_orders_sel on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists p_txs_sel on public.bank_txs;
create policy p_txs_sel on public.bank_txs for select using (public.is_admin());

-- =====================================================================
-- Hàm máy chủ
-- =====================================================================

-- Admin: sửa danh bạ, gói & giá, cài đặt (ghi nhật ký)
create or replace function public.admin_save_vendor(p_id text, p_data jsonb, p_active boolean) returns void
language plpgsql security definer set search_path = public as $$
declare existed boolean;
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  existed := exists (select 1 from public.vendor_directory where id = p_id);
  insert into public.vendor_directory (id, data, active, updated_at) values (p_id, p_data, p_active, now())
  on conflict (id) do update set data = excluded.data, active = excluded.active, updated_at = now();
  perform public.log_audit(case when not existed then 'Thêm nhà cung cấp' when not p_active then 'Ẩn / sửa nhà cung cấp' else 'Sửa nhà cung cấp' end, p_data->>'name');
end $$;

create or replace function public.admin_save_product(p_id text, p_data jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare old_price bigint;
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  select (data->>'price')::bigint into old_price from public.products where id = p_id;
  update public.products set data = p_data, updated_at = now() where id = p_id;
  perform public.log_audit('Sửa gói & giá', p_data->>'name',
    case when old_price is distinct from (p_data->>'price')::bigint then format('Giá %s → %s đ', old_price, p_data->>'price') end);
end $$;

create or replace function public.admin_save_settings(p_data jsonb, p_what text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  update public.app_settings set data = p_data where id = 1;
  perform public.log_audit('Đổi cài đặt', p_what);
end $$;

create or replace function public.admin_set_user(p_uid uuid, p_locked boolean, p_note text, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare u public.profiles;
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  select * into u from public.profiles where id = p_uid;
  update public.profiles set locked = coalesce(p_locked, locked), support_note = coalesce(p_note, support_note) where id = p_uid;
  if p_locked is not null and p_locked <> u.locked then
    perform public.log_audit(case when p_locked then 'Khóa tài khoản' else 'Mở khóa tài khoản' end, u.name || ' · ' || coalesce(u.phone, u.email, ''), p_reason);
  end if;
end $$;

-- Admin: danh sách đám hiếu chỉ gồm tên và trạng thái (không nội dung riêng tư)
create or replace function public.admin_cases()
returns table (id text, owner_id uuid, name text, access jsonb, closed boolean, delete_requested_at timestamptz, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.id, c.owner_id,
         trim(coalesce(c.data->'person'->>'title', '') || ' ' || coalesce(nullif(c.data->'person'->>'name', ''), 'Người đã khuất (chưa nhập tên)')),
         c.access, coalesce((c.data->'after'->>'closed')::boolean, false), c.delete_requested_at, c.created_at
  from public.cases c where public.is_admin() order by c.created_at desc
$$;

create or replace function public.admin_set_case_access(p_case text, p_open boolean, p_reason text, p_until timestamptz) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Ghi lý do'; end if;
  update public.cases set access = case when p_open
      then jsonb_strip_nulls(jsonb_build_object('plan', 'full', 'source', 'manual', 'activeUntil', p_until))
      else jsonb_build_object('plan', 'free', 'revokedReason', p_reason) end
  where id = p_case;
  perform public.log_audit(case when p_open then 'Mở quyền thủ công' else 'Thu hồi quyền' end, 'Đám hiếu ' || p_case, p_reason);
end $$;

-- Mở quyền theo đơn đã thanh toán (dùng chung cho khớp tự động và gán tay)
create or replace function public.apply_paid_order(p_code text) returns void
language plpgsql security definer set search_path = public as $$
declare o public.orders;
begin
  select * into o from public.orders where code = p_code;
  if o.data->'target'->>'kind' = 'case' then
    update public.cases set access = jsonb_strip_nulls(jsonb_build_object('plan', 'full', 'source', 'payment', 'orderId', p_code,
      'activeUntil', o.data->>'until'))
    where id = o.data->'target'->>'id';
  else
    update public.pre_needs set paid = true, order_code = p_code where id = o.data->'target'->>'id';
  end if;
end $$;

-- Tạo đơn: giá lấy từ bảng gói (không tin số tiền từ trình duyệt), kiểm tra người trả có quyền
create or replace function public.create_order(p_product text, p_kind text, p_target text, p_name text, p_return text, p_until timestamptz)
returns public.orders
language plpgsql security definer set search_path = public as $$
declare prod jsonb; o public.orders; c text; ok boolean;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select data into prod from public.products where id = p_product;
  if prod is null or not coalesce((prod->>'active')::boolean, false) then raise exception 'Gói này đang tạm ngừng bán.'; end if;
  if coalesce((prod->>'price')::bigint, 0) <= 0 then raise exception 'Gói chưa có giá. Admin cần nhập giá trước khi bán.'; end if;
  if p_kind = 'case' then
    ok := public.is_case_owner(p_target) or exists (select 1 from public.case_members m where m.case_id = p_target and m.access = 'full'
            and (m.user_id = auth.uid() or m.phone = public.my_phone()));
  else
    ok := public.pre_role(p_target) = 'owner';
  end if;
  if not ok then raise exception 'Anh/chị không có quyền mở gói cho mục này.'; end if;
  select * into o from public.orders where user_id = auth.uid() and status = 'pending' and data->'target'->>'id' = p_target
    and data->>'product' = p_product and (data->>'expiresAt')::timestamptz > now() limit 1;
  if found then return o; end if;
  loop
    c := 'DH' || (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 6));
    exit when not exists (select 1 from public.orders where code = c);
  end loop;
  insert into public.orders (code, user_id, amount, status, data) values (c, auth.uid(), (prod->>'price')::bigint, 'pending',
    jsonb_strip_nulls(jsonb_build_object('id', c, 'code', c, 'userId', auth.uid(), 'product', p_product, 'productName', prod->>'name',
      'target', jsonb_build_object('kind', p_kind, 'id', p_target, 'name', p_name), 'amount', (prod->>'price')::bigint, 'status', 'pending',
      'createdAt', now(), 'expiresAt', now() + interval '24 hours', 'returnTo', p_return, 'until', p_until)))
  returning * into o;
  perform public.log_audit('Tạo đơn', c, format('%s · %s đ', prod->>'name', prod->>'price'));
  return o;
end $$;

-- Giả lập ngân hàng báo giao dịch — CHỈ khi cài đặt SePay ở môi trường thử. Phase 4 thay bằng webhook đã xác thực.
create or replace function public.simulate_bank_tx(p_provider_id text, p_amount bigint, p_content text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare st jsonb; v_code text; o public.orders; tx_status text := 'unmatched'; reason text; tid text;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select data into st from public.app_settings where id = 1;
  if st->'sepay'->>'env' <> 'test' then raise exception 'Chỉ giả lập được ở môi trường thử'; end if;
  if exists (select 1 from public.bank_txs where provider_tx_id = p_provider_id) then
    return jsonb_build_object('duplicate', true);
  end if;
  v_code := substring(upper(p_content) from 'DH[A-Z0-9]{6}');
  select * into o from public.orders where orders.code = v_code;
  if o.code is null then reason := 'Không tìm thấy mã đơn trong nội dung';
  elsif o.status <> 'pending' then reason := 'Đơn không còn ở trạng thái chờ thanh toán';
  elsif (o.data->>'expiresAt')::timestamptz < now() then reason := 'Đơn đã hết hạn';
  elsif p_amount <> o.amount then reason := case when p_amount < o.amount then 'Thiếu tiền' else 'Thừa tiền' end;
  else tx_status := 'matched';
  end if;
  tid := 'tx' || substr(md5(random()::text), 1, 8);
  insert into public.bank_txs (id, provider_tx_id, status, order_code, data) values (tid, p_provider_id, tx_status, o.code,
    jsonb_strip_nulls(jsonb_build_object('id', tid, 'providerTxId', p_provider_id, 'amount', p_amount, 'content', p_content,
      'account', coalesce(st->'sepay'->'account'->>'number', 'THU'), 'at', now(), 'status', tx_status, 'orderId', o.code, 'reason', reason)));
  if tx_status = 'matched' then
    update public.orders set status = 'paid', data = data || jsonb_build_object('status', 'paid', 'paidAt', now(), 'txId', tid) where orders.code = o.code;
    perform public.apply_paid_order(o.code);
    insert into public.audit_log (actor, action, target, detail) values ('SePay (giả lập)', 'Khớp giao dịch', o.code, p_amount || ' đ');
  else
    insert into public.audit_log (actor, action, target, detail) values ('SePay (giả lập)', 'Giao dịch chưa khớp', p_provider_id, reason);
  end if;
  return jsonb_build_object('duplicate', false, 'status', tx_status, 'reason', reason, 'order', o.code);
end $$;

create or replace function public.admin_assign_tx(p_tx text, p_code text, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare t public.bank_txs; o public.orders;
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Ghi lý do gán tay.'; end if;
  select * into t from public.bank_txs where id = p_tx;
  if t.status <> 'unmatched' then raise exception 'Giao dịch không ở trạng thái chưa khớp.'; end if;
  select * into o from public.orders where code = upper(trim(p_code));
  if o.code is null then raise exception 'Không tìm thấy đơn với mã này.'; end if;
  if o.status = 'paid' then raise exception 'Đơn này đã thanh toán.'; end if;
  update public.bank_txs set status = 'matched', order_code = o.code, data = data || jsonb_build_object('status', 'matched', 'orderId', o.code) where id = p_tx;
  update public.orders set status = 'paid', data = data || jsonb_build_object('status', 'paid', 'paidAt', now(), 'txId', p_tx, 'note', 'Gán tay: ' || p_reason) where code = o.code;
  perform public.apply_paid_order(o.code);
  perform public.log_audit('Gán giao dịch vào đơn', o.code, p_reason);
end $$;

create or replace function public.admin_refund(p_kind text, p_id text, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  if coalesce(trim(p_reason), '') = '' then raise exception 'Ghi lý do hoàn tiền.'; end if;
  if p_kind = 'tx' then
    update public.bank_txs set status = 'refunded', data = data || jsonb_build_object('status', 'refunded', 'reason', p_reason) where id = p_id;
    perform public.log_audit('Đánh dấu hoàn tiền', p_id, p_reason);
  else
    update public.orders set status = 'refunded', data = data || jsonb_build_object('status', 'refunded', 'note', p_reason) where code = p_id;
    perform public.log_audit('Hoàn tiền đơn (xử lý tay)', p_id, p_reason);
  end if;
end $$;

-- Kích hoạt hồ sơ chuẩn bị: tạo đám hiếu mở đầy đủ (không thu lần hai), hồ sơ chuyển chỉ đọc
create or replace function public.activate_pre_need(p_pre text, p_case_id text, p_data jsonb, p_until timestamptz) returns void
language plpgsql security definer set search_path = public as $$
declare p public.pre_needs; r text;
begin
  select * into p from public.pre_needs where id = p_pre;
  if p.id is null then raise exception 'Không tìm thấy hồ sơ.'; end if;
  r := public.pre_role(p_pre);
  if r not in ('owner', 'activate') then raise exception 'Anh/chị chưa có quyền kích hoạt hồ sơ này.'; end if;
  if not p.paid then raise exception 'Kích hoạt thuộc gói Chuẩn bị trước.'; end if;
  if p.case_id is not null then raise exception 'Hồ sơ đã được kích hoạt.'; end if;
  insert into public.cases (id, owner_id, data, access) values (p_case_id, auth.uid(), p_data,
    jsonb_strip_nulls(jsonb_build_object('plan', 'full', 'source', 'activation', 'activeUntil', p_until)));
  update public.pre_needs set case_id = p_case_id, activated_at = now(),
    data = data || jsonb_build_object('caseId', p_case_id, 'activatedAt', now(), 'activatedBy', (select name from public.profiles where id = auth.uid()))
  where id = p_pre;
  perform public.log_audit('Kích hoạt hồ sơ chuẩn bị', coalesce(p.data->'subject'->>'name', p_pre));
end $$;

-- Tên người trong đội (để thành viên thấy tên người đại diện, v.v.) đã nằm trong data.members nên không cần hàm riêng.

grant execute on all functions in schema public to authenticated;
-- Hàm nội bộ: mặc định Postgres cho PUBLIC gọi mọi hàm, nên phải thu hồi cả PUBLIC
revoke execute on function public.handle_new_user() from public, authenticated, anon;
revoke execute on function public.cases_before_write() from public, authenticated, anon;
revoke execute on function public.cases_after_write() from public, authenticated, anon;
revoke execute on function public.apply_paid_order(text) from public, authenticated, anon;
revoke execute on function public.log_audit(text, text, text) from public, authenticated, anon;
-- Khách chưa đăng nhập không gọi hàm nào
revoke execute on all functions in schema public from anon;

-- Cập nhật tức thời cho cả nhà khi có người sửa
do $$ begin
  alter publication supabase_realtime add table public.cases;
exception when others then null; end $$;

-- =====================================================================
-- NÂNG TÀI KHOẢN THÀNH ADMIN (chạy riêng, SAU KHI đã đăng ký tài khoản trong app bằng số điện thoại):
--   update public.profiles set is_admin = true where phone = '09xxxxxxxx';
-- =====================================================================
