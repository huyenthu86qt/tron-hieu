-- =====================================================================
-- TRỌN HIẾU · Phase 3c · Chuyển quyền đại diện + xóa theo yêu cầu (sau 7 ngày) + giữ lịch sử đơn hàng
-- Chạy SAU 0001–0004. Chạy lại được.
--
-- Nguyên tắc (Chủ dự án chốt 26/09/2026):
--  • Chỉ xóa khi khách tự yêu cầu. Có 7 ngày để hủy. Admin không có nút tự xóa dữ liệu của khách.
--  • Chỉ người đại diện yêu cầu xóa đám hiếu; chỉ chính chủ yêu cầu xóa tài khoản.
--  • Người đại diện xóa tài khoản: phải CHUYỂN QUYỀN ĐẠI DIỆN cho người thân trong đội trước;
--    đám hiếu không còn ai khác trong đội thì xóa cùng tài khoản (đã cảnh báo trong app).
--  • Đơn hàng / giao dịch là chứng từ thanh toán: giữ lại (bỏ liên kết tài khoản), không xóa theo tài khoản.
-- =====================================================================

-- ---------- Giữ đơn hàng khi xóa tài khoản ----------
alter table public.orders alter column user_id drop not null;
alter table public.orders drop constraint if exists orders_user_id_fkey;
alter table public.orders add constraint orders_user_id_fkey foreign key (user_id) references auth.users on delete set null;

-- ---------- Chỉ người đại diện được yêu cầu / hủy yêu cầu xóa đám hiếu ----------
create or replace function public.cases_before_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and coalesce(current_setting('tronhieu.system', true), '') <> '1' then
    if new.owner_id <> old.owner_id then raise exception 'Không đổi được người đại diện qua đường này'; end if;
    if (new.data->'members') is distinct from (old.data->'members') and not public.is_case_owner(new.id) then
      raise exception 'Chỉ người đại diện gia đình sửa được đội';
    end if;
    if new.delete_requested_at is distinct from old.delete_requested_at and not public.is_case_owner(new.id) then
      raise exception 'Chỉ người đại diện gia đình yêu cầu xóa đám hiếu';
    end if;
  end if;
  new.data := new.data - 'access' - 'ledger';
  new.updated_at := now();
  return new;
end $$;

-- ---------- Chuyển quyền đại diện ----------
-- App tính sẵn nội dung đội sau khi đổi (người mới thành “người đại diện”), máy chủ kiểm tra rồi đổi chủ đám hiếu.
create or replace function public.transfer_owner(p_case text, p_new_user uuid, p_data jsonb, p_version int) returns void
language plpgsql security definer set search_path = public as $$
declare c public.cases; u1 jsonb; newp public.profiles; oldp public.profiles;
begin
  select * into c from public.cases where id = p_case for update;
  if c.id is null then raise exception 'Không tìm thấy đám hiếu'; end if;
  if c.owner_id <> auth.uid() then raise exception 'Chỉ người đại diện hiện tại chuyển quyền được'; end if;
  if c.version <> p_version then raise exception 'Có người vừa cập nhật đám hiếu — tải lại rồi thử lại'; end if;
  if p_new_user = auth.uid() then raise exception 'Chọn một người khác trong đội'; end if;
  -- Người nhận phải đã nhận lời mời, đang ở trong đội (không phải người nhận việc qua link)
  if not exists (select 1 from public.case_members m where m.case_id = p_case and m.user_id = p_new_user and m.access <> 'link') then
    raise exception 'Người nhận quyền cần đã tham gia đội bằng tài khoản';
  end if;
  select x into u1 from jsonb_array_elements(p_data->'members') x where x->>'id' = 'u1';
  if u1 is null or u1->>'userId' is distinct from p_new_user::text then raise exception 'Nội dung chuyển quyền không khớp'; end if;
  select * into newp from public.profiles where id = p_new_user;
  select * into oldp from public.profiles where id = auth.uid();
  p_data := jsonb_set(p_data, '{history}', coalesce(p_data->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
    'at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'text', coalesce(oldp.name, '') || ' chuyển quyền người đại diện gia đình cho ' || coalesce(newp.name, ''))));
  perform set_config('tronhieu.system', '1', true);
  update public.cases set owner_id = p_new_user, data = p_data, version = version + 1, delete_requested_at = null where id = p_case;
  perform set_config('tronhieu.system', '', true);
  perform public.log_audit('Chuyển quyền người đại diện', 'Đám hiếu ' || p_case, coalesce(oldp.name, '') || ' → ' || coalesce(newp.name, ''));
end $$;

-- ---------- Xóa theo yêu cầu, sau đúng 7 ngày ----------
create or replace function public.process_deletions() returns jsonb
language plpgsql security definer set search_path = public as $$
declare r record; n_cases int := 0; n_users int := 0;
begin
  perform set_config('tronhieu.system', '1', true);
  -- 1) Đám hiếu người đại diện yêu cầu xóa
  for r in select id, data->'person'->>'name' as nm from public.cases
           where delete_requested_at is not null and delete_requested_at < now() - interval '7 days' loop
    delete from public.cases where id = r.id;
    insert into public.audit_log (actor, action, target, detail) values ('Hệ thống', 'Xóa đám hiếu theo yêu cầu (sau 7 ngày)', 'Đám hiếu ' || r.id, null);
    n_cases := n_cases + 1;
  end loop;
  -- 2) Tài khoản chính chủ yêu cầu xóa
  for r in select id, name, phone from public.profiles
           where delete_requested_at is not null and delete_requested_at < now() - interval '7 days' loop
    -- Bỏ liên kết tài khoản khỏi các đội người đó tham gia (tên vẫn còn trong lịch sử việc)
    update public.cases c set data = jsonb_set(c.data, '{members}', (
        select jsonb_agg(case when m->>'userId' = r.id::text then m - 'userId' else m end) from jsonb_array_elements(c.data->'members') m))
      where c.owner_id <> r.id and exists (select 1 from public.case_members cm where cm.case_id = c.id and cm.user_id = r.id);
    update public.pre_needs p set data = jsonb_set(p.data, '{shares}', (
        select coalesce(jsonb_agg(s), '[]'::jsonb) from jsonb_array_elements(p.data->'shares') s where s->>'userId' is distinct from r.id::text))
      where p.owner_id <> r.id and jsonb_typeof(p.data->'shares') = 'array';
    -- Xóa tài khoản: hồ sơ, đám hiếu còn đứng tên, hồ sơ chuẩn bị đi theo (đơn hàng được giữ, bỏ liên kết)
    delete from auth.users where id = r.id;
    insert into public.audit_log (actor, action, target, detail) values ('Hệ thống', 'Xóa tài khoản theo yêu cầu (sau 7 ngày)', coalesce(r.name, ''), null);
    n_users := n_users + 1;
  end loop;
  perform set_config('tronhieu.system', '', true);
  return jsonb_build_object('cases', n_cases, 'users', n_users);
end $$;

-- ---------- Tệp của đám hiếu / hồ sơ đã xóa: Admin dọn (chỉ tệp mồ côi, không đọc được nội dung) ----------
create or replace function public.admin_orphan_files() returns table (bucket text, path text)
language sql stable security definer set search_path = public, storage as $$
  select o.bucket_id, o.name from storage.objects o
  where public.is_admin() and (
    (o.bucket_id = 'case-files' and not exists (select 1 from public.cases c where c.id = split_part(o.name, '/', 1)))
    or (o.bucket_id = 'pre-files' and not exists (select 1 from public.pre_needs p where p.id = split_part(o.name, '/', 1))))
  limit 500
$$;

drop policy if exists th_orphan_read on storage.objects;
create policy th_orphan_read on storage.objects for select to authenticated using (
  public.is_admin() and (
    (bucket_id = 'case-files' and not exists (select 1 from public.cases c where c.id = (storage.foldername(name))[1]))
    or (bucket_id = 'pre-files' and not exists (select 1 from public.pre_needs p where p.id = (storage.foldername(name))[1]))));
drop policy if exists th_orphan_del on storage.objects;
create policy th_orphan_del on storage.objects for delete to authenticated using (
  public.is_admin() and (
    (bucket_id = 'case-files' and not exists (select 1 from public.cases c where c.id = (storage.foldername(name))[1]))
    or (bucket_id = 'pre-files' and not exists (select 1 from public.pre_needs p where p.id = (storage.foldername(name))[1]))));

-- ---------- Admin xem các yêu cầu xóa đang chờ (chỉ tên và ngày, không nội dung) ----------
create or replace function public.admin_pending_deletions()
returns table (kind text, id text, name text, requested_at timestamptz, delete_at timestamptz)
language sql stable security definer set search_path = public as $$
  select 'case', c.id, trim(coalesce(c.data->'person'->>'title', '') || ' ' || coalesce(c.data->'person'->>'name', '')), c.delete_requested_at, c.delete_requested_at + interval '7 days'
    from public.cases c where public.is_admin() and c.delete_requested_at is not null
  union all
  select 'user', p.id::text, p.name || coalesce(' · ' || p.phone, ''), p.delete_requested_at, p.delete_requested_at + interval '7 days'
    from public.profiles p where public.is_admin() and p.delete_requested_at is not null
  order by 5
$$;

revoke execute on function public.process_deletions() from public, anon, authenticated;
revoke execute on function public.transfer_owner(text, uuid, jsonb, int) from public, anon;
grant execute on function public.transfer_owner(text, uuid, jsonb, int) to authenticated;
revoke execute on function public.admin_orphan_files() from public, anon;
grant execute on function public.admin_orphan_files() to authenticated;
revoke execute on function public.admin_pending_deletions() from public, anon;
grant execute on function public.admin_pending_deletions() to authenticated;

-- ---------- Chạy xóa tự động mỗi đêm lúc 2 giờ sáng (giờ Việt Nam) ----------
do $$ begin
  create extension if not exists pg_cron;
exception when others then raise notice 'Chưa bật được pg_cron: %', sqlerrm; end $$;
do $$ begin
  perform cron.unschedule('tronhieu-xoa-theo-yeu-cau');
exception when others then null; end $$;
do $$ begin
  perform cron.schedule('tronhieu-xoa-theo-yeu-cau', '0 19 * * *', 'select public.process_deletions()');
exception when others then raise notice 'Chưa đặt lịch được: %', sqlerrm; end $$;
