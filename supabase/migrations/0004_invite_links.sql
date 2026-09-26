-- =====================================================================
-- TRỌN HIẾU · Mời vào đội bằng link + đăng nhập Google + tự đổi số điện thoại
-- Chạy SAU 0001–0003. Chạy lại được.
--
-- Vì sao: chưa có bên gửi OTP nên số điện thoại chưa được xác minh. Từ nay số điện thoại
-- KHÔNG còn là chìa khóa vào đám hiếu / hồ sơ chuẩn bị. Người được mời vào bằng LINK MỜI
-- (mã 20 ký tự ngẫu nhiên) do người đại diện gửi qua Zalo; mở link + đăng nhập thì tài khoản
-- được gắn vào đúng vị trí trong đội.
-- =====================================================================

-- ---------- Cho phép hàm hệ thống sửa đội (gắn tài khoản khi nhận lời mời) ----------
create or replace function public.cases_before_write() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' and coalesce(current_setting('tronhieu.system', true), '') <> '1' then
    if new.owner_id <> old.owner_id then raise exception 'Không đổi được người đại diện qua đường này'; end if;
    if (new.data->'members') is distinct from (old.data->'members') and not public.is_case_owner(new.id) then
      raise exception 'Chỉ người đại diện gia đình sửa được đội';
    end if;
  end if;
  new.data := new.data - 'access' - 'ledger';
  new.updated_at := now();
  return new;
end $$;

-- ---------- Gắn sẵn tài khoản cho những người đã vào đội bằng số điện thoại trước đây ----------
do $$
declare r record; d jsonb;
begin
  perform set_config('tronhieu.system', '1', true);
  for r in select id, data from public.cases loop
    select jsonb_agg(case
             when (m->>'userId') is null and (m->>'inviteToken') is null and coalesce(m->>'access', '') <> 'link' and m->>'id' <> 'u1'
                  and exists (select 1 from public.profiles p where p.phone = m->>'phone')
             then m || jsonb_build_object('userId', (select p.id::text from public.profiles p where p.phone = m->>'phone'))
             else m end)
      into d from jsonb_array_elements(coalesce(r.data->'members', '[]'::jsonb)) m;
    if d is not null and d is distinct from r.data->'members' then
      update public.cases set data = jsonb_set(data, '{members}', d) where id = r.id;
    end if;
  end loop;
  perform set_config('tronhieu.system', '', true);
end $$;

-- ---------- Quyền vào đám hiếu: chỉ theo tài khoản đã gắn (không còn theo số điện thoại) ----------
create or replace function public.is_case_member(cid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_case_owner(cid) or exists (
    select 1 from public.case_members m
    where m.case_id = cid and m.access <> 'link' and m.user_id = auth.uid()
  )
$$;

create or replace function public.is_case_fin(cid text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_case_owner(cid) or exists (
    select 1 from public.case_members m
    where m.case_id = cid and m.access <> 'link' and m.user_id = auth.uid()
      and (m.member_id = 'u1' or m.areas && array['Toàn bộ', 'Tài chính'])
  )
$$;

-- ---------- Xem trước lời mời (chưa đăng nhập cũng xem được, chỉ thông tin tối thiểu) ----------
create or replace function public.invite_preview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c record; m jsonb; u1 jsonb;
begin
  if length(coalesce(p_token, '')) < 16 then return null; end if;
  select cs.id, cs.data, mm into c
    from public.cases cs, jsonb_array_elements(coalesce(cs.data->'members', '[]'::jsonb)) mm
    where mm->>'inviteToken' = p_token limit 1;
  if c.id is null then return null; end if;
  m := c.mm;
  select x into u1 from jsonb_array_elements(c.data->'members') x where x->>'id' = 'u1';
  return jsonb_build_object(
    'caseId', c.id,
    'caseName', trim(coalesce(c.data->'person'->>'title', '') || ' ' || coalesce(nullif(c.data->'person'->>'name', ''), '')),
    'inviter', u1->>'name', 'memberName', m->>'name', 'memberRel', m->>'rel', 'access', m->>'access',
    'joined', (m->>'userId') is not null and (m->>'userId') = auth.uid()::text);
end $$;

-- ---------- Nhận lời mời: gắn tài khoản đang đăng nhập vào vị trí trong đội ----------
create or replace function public.claim_invite(p_token text) returns text
language plpgsql security definer set search_path = public as $$
declare v_case text; d jsonb; i int; m jsonb; me public.profiles;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  if length(coalesce(p_token, '')) < 16 then raise exception 'Lời mời không còn dùng được'; end if;
  select cs.id into v_case from public.cases cs, jsonb_array_elements(coalesce(cs.data->'members', '[]'::jsonb)) mm
    where mm->>'inviteToken' = p_token limit 1;
  if v_case is null then raise exception 'Lời mời không còn dùng được — người đại diện có thể đã tạo link mới'; end if;
  select data into d from public.cases where id = v_case for update;
  if public.is_case_member(v_case) then return v_case; end if;
  select (x.idx - 1)::int, x.m into i, m from jsonb_array_elements(d->'members') with ordinality as x(m, idx)
    where x.m->>'inviteToken' = p_token;
  select * into me from public.profiles where id = auth.uid();
  m := (m - 'inviteToken') || jsonb_build_object('userId', auth.uid()::text)
       || case when coalesce(m->>'phone', '') = '' and me.phone is not null then jsonb_build_object('phone', me.phone) else '{}'::jsonb end;
  d := jsonb_set(d, array['members', i::text], m);
  d := jsonb_set(d, '{history}', coalesce(d->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
         'at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
         'text', (m->>'name') || ' đã nhận lời mời và tham gia đội (tài khoản ' || coalesce(me.name, '') || ')')));
  perform set_config('tronhieu.system', '1', true);
  update public.cases set data = d, version = version + 1 where id = v_case;
  perform set_config('tronhieu.system', '', true);
  return v_case;
end $$;

-- ---------- Hồ sơ chuẩn bị: chia sẻ cũng bằng link mời ----------
create or replace function public.pre_role(pid text) returns text
language sql stable security definer set search_path = public as $$
  select case
    when p.owner_id = auth.uid() then 'owner'
    else (select s->>'role' from jsonb_array_elements(coalesce(p.data->'shares', '[]'::jsonb)) s
          where s->>'userId' = auth.uid()::text limit 1)
  end
  from public.pre_needs p where p.id = pid
$$;

-- Gắn sẵn tài khoản cho người đã được chia sẻ bằng số điện thoại trước đây
update public.pre_needs pn set data = jsonb_set(pn.data, '{shares}', (
  select jsonb_agg(case when (s->>'userId') is null and (s->>'inviteToken') is null and exists (select 1 from public.profiles p where p.phone = s->>'phone')
                        then s || jsonb_build_object('userId', (select p.id::text from public.profiles p where p.phone = s->>'phone'))
                        else s end)
  from jsonb_array_elements(pn.data->'shares') s))
where jsonb_typeof(pn.data->'shares') = 'array' and jsonb_array_length(pn.data->'shares') > 0;

create or replace function public.pre_invite_preview(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare p record;
begin
  if length(coalesce(p_token, '')) < 16 then return null; end if;
  select pn.id, pn.owner_id, pn.data, s into p from public.pre_needs pn, jsonb_array_elements(coalesce(pn.data->'shares', '[]'::jsonb)) s
    where s->>'inviteToken' = p_token limit 1;
  if p.id is null then return null; end if;
  return jsonb_build_object('preId', p.id, 'subject', coalesce(p.data->'subject'->>'name', ''),
    'inviter', (select name from public.profiles where id = p.owner_id), 'memberName', p.s->>'name', 'role', p.s->>'role');
end $$;

create or replace function public.claim_pre_invite(p_token text) returns text
language plpgsql security definer set search_path = public as $$
declare v_id text; d jsonb; i int; s jsonb;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select pn.id into v_id from public.pre_needs pn, jsonb_array_elements(coalesce(pn.data->'shares', '[]'::jsonb)) x
    where length(coalesce(p_token, '')) >= 16 and x->>'inviteToken' = p_token limit 1;
  if v_id is null then raise exception 'Lời mời không còn dùng được'; end if;
  if public.pre_role(v_id) is not null then return v_id; end if;
  select data into d from public.pre_needs where id = v_id for update;
  select (x.idx - 1)::int, x.s into i, s from jsonb_array_elements(d->'shares') with ordinality as x(s, idx)
    where x.s->>'inviteToken' = p_token;
  d := jsonb_set(d, array['shares', i::text], (s - 'inviteToken') || jsonb_build_object('userId', auth.uid()::text));
  update public.pre_needs set data = d where id = v_id;
  return v_id;
end $$;

-- ---------- Tự đổi số điện thoại (trang Tài khoản) ----------
create or replace function public.set_my_phone(p_phone text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  if p_phone !~ '^0(3|5|7|8|9)[0-9]{8}$' then raise exception 'Số điện thoại chưa đúng.'; end if;
  if exists (select 1 from public.profiles where phone = p_phone and id <> auth.uid()) then
    raise exception 'Số điện thoại này đã thuộc tài khoản khác.';
  end if;
  update public.profiles set phone = p_phone where id = auth.uid();
end $$;

-- ---------- Admin đặt mật khẩu tạm (sau khi đã gọi xác nhận đúng chủ tài khoản) ----------
create or replace function public.admin_set_temp_password(p_uid uuid, p_password text) returns void
language plpgsql security definer set search_path = public, extensions as $$
declare u public.profiles;
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  if length(coalesce(p_password, '')) < 8 then raise exception 'Mật khẩu tạm cần ít nhất 8 ký tự.'; end if;
  select * into u from public.profiles where id = p_uid;
  update auth.users set encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')), updated_at = now() where id = p_uid;
  perform public.log_audit('Đặt mật khẩu tạm (đã gọi xác nhận)', coalesce(u.name, '') || ' · ' || coalesce(u.phone, u.email, ''));
end $$;

revoke execute on function public.admin_set_temp_password(uuid, text) from public, anon;
grant execute on function public.admin_set_temp_password(uuid, text) to authenticated;
revoke execute on function public.set_my_phone(text) from public, anon;
grant execute on function public.set_my_phone(text) to authenticated;
revoke execute on function public.claim_invite(text) from public, anon;
grant execute on function public.claim_invite(text) to authenticated;
revoke execute on function public.claim_pre_invite(text) from public, anon;
grant execute on function public.claim_pre_invite(text) to authenticated;
grant execute on function public.invite_preview(text) to anon, authenticated;
grant execute on function public.pre_invite_preview(text) to anon, authenticated;

-- ---------- Link nhờ việc: không trả mã mời của người khác trong đội ----------
create or replace function public.link_view(p_token text) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare f record; d jsonb; mid text;
begin
  select * into f from public.link_find(p_token);
  if f.v_case is null then return null; end if;
  select data into d from public.cases where id = f.v_case;
  mid := f.v_member->>'id';
  return jsonb_build_object(
    'memberId', mid,
    'case', jsonb_build_object(
      'id', f.v_case,
      'createdAt', d->'createdAt',
      'situation', d->'situation',
      'person', coalesce(d->'person', '{}'::jsonb) - 'photo',
      'venues', d->'venues',
      'areas', coalesce(d->'areas', '[]'::jsonb),
      'decisions', coalesce(d->'decisions', '[]'::jsonb),
      'mourning', coalesce(d->'mourning', 'false'::jsonb),
      'history', '[]'::jsonb,
      -- Việc của người khác: bỏ lời nhắn, ghi chú, tệp, vấn đề
      'tasks', (select coalesce(jsonb_agg(case when t->>'owner' = mid then t
                  else t - 'assignNote' - 'note' - 'evidence' - 'evidencePath' - 'issue' end), '[]'::jsonb)
                from jsonb_array_elements(coalesce(d->'tasks', '[]'::jsonb)) t),
      -- Thành viên: không số điện thoại, không tài khoản, không mã link
      'members', (select coalesce(jsonb_agg(x - 'phone' - 'userId' - 'linkToken' - 'inviteToken'), '[]'::jsonb)
                  from jsonb_array_elements(coalesce(d->'members', '[]'::jsonb)) x)
    ));
end $$;
