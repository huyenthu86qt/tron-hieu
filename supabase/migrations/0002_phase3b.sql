-- =====================================================================
-- TRỌN HIẾU · Phase 3b · Lưu tệp thật + link nhờ việc dùng được trên máy khác
-- Chạy SAU 0001. Chạy lại được. Nếu có lúc chạy lại 0001 thì chạy lại cả tệp này
-- (0001 thu hồi mọi quyền gọi hàm của khách chưa đăng nhập).
--
-- Nguyên tắc:
--  • Tệp nằm trong kho riêng tư (không có đường dẫn công khai). Mở tệp bằng link ký tạm vài phút.
--  • Tệp của đám hiếu: chỉ thành viên đám hiếu đọc được; chứng từ chi tiêu (thư mục fin) chỉ người giữ Tài chính đọc.
--  • Tệp hồ sơ chuẩn bị: chỉ người được chia sẻ hồ sơ đọc; người sửa được hồ sơ mới thêm / bỏ tệp.
--  • Link nhờ việc: người nhận không cần tài khoản. Máy chủ chỉ trả đúng việc được nhờ và thông tin tối thiểu,
--    không có số điện thoại, tài chính, sổ phúng viếng, ảnh thờ; và chỉ cho đổi trạng thái việc được giao cho người đó.
-- =====================================================================

-- ---------- Kho tệp ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('case-files', 'case-files', false, 15728640), ('pre-files', 'pre-files', false, 15728640)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

-- Tệp đám hiếu: <mã đám hiếu>/<loại>/<tên>. Loại 'fin' = chứng từ chi tiêu.
drop policy if exists th_case_files_read on storage.objects;
create policy th_case_files_read on storage.objects for select to authenticated using (
  bucket_id = 'case-files' and case
    when (storage.foldername(name))[2] = 'fin' then public.is_case_fin((storage.foldername(name))[1])
    else public.is_case_member((storage.foldername(name))[1]) end);
drop policy if exists th_case_files_add on storage.objects;
create policy th_case_files_add on storage.objects for insert to authenticated with check (
  bucket_id = 'case-files' and public.is_case_member((storage.foldername(name))[1]));
drop policy if exists th_case_files_del on storage.objects;
create policy th_case_files_del on storage.objects for delete to authenticated using (
  bucket_id = 'case-files' and (public.is_case_owner((storage.foldername(name))[1]) or owner_id = auth.uid()::text));

-- Tệp hồ sơ chuẩn bị: <mã hồ sơ>/<tên>
drop policy if exists th_pre_files_read on storage.objects;
create policy th_pre_files_read on storage.objects for select to authenticated using (
  bucket_id = 'pre-files' and (public.pre_role((storage.foldername(name))[1]) is not null
    -- Hồ sơ đã kích hoạt: giấy tờ đã chuyển vào Tài liệu của đám hiếu, cả đội mở được
    or exists (select 1 from public.pre_needs p where p.id = (storage.foldername(name))[1]
               and p.case_id is not null and public.is_case_member(p.case_id))));
drop policy if exists th_pre_files_add on storage.objects;
create policy th_pre_files_add on storage.objects for insert to authenticated with check (
  bucket_id = 'pre-files' and public.pre_role((storage.foldername(name))[1]) in ('owner', 'edit', 'activate'));
drop policy if exists th_pre_files_del on storage.objects;
create policy th_pre_files_del on storage.objects for delete to authenticated using (
  bucket_id = 'pre-files' and public.pre_role((storage.foldername(name))[1]) in ('owner', 'edit', 'activate'));

-- ---------- Link nhờ việc ----------
-- Tìm thành viên nhận việc qua link (mã đủ dài, còn ở chế độ “Chỉ qua link”)
create or replace function public.link_find(p_token text, out v_case text, out v_member jsonb)
language sql stable security definer set search_path = public as $$
  select cs.id, mm from public.cases cs, jsonb_array_elements(coalesce(cs.data->'members', '[]'::jsonb)) mm
  where length(coalesce(p_token, '')) >= 10 and mm->>'linkToken' = p_token and mm->>'access' = 'link'
  limit 1
$$;

-- Xem việc được nhờ: bản rút gọn, bỏ mọi thông tin riêng tư
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
      'members', (select coalesce(jsonb_agg(x - 'phone' - 'userId' - 'linkToken'), '[]'::jsonb)
                  from jsonb_array_elements(coalesce(d->'members', '[]'::jsonb)) x)
    ));
end $$;

-- Đổi trạng thái một việc được nhờ (nhận việc, đã xong, báo vấn đề)
create or replace function public.link_act(p_token text, p_task jsonb, p_log text) returns void
language plpgsql security definer set search_path = public as $$
declare f record; d jsonb; i int; old jsonb; allowed text[] := array['status', 'issue'];
begin
  select * into f from public.link_find(p_token);
  if f.v_case is null then raise exception 'Link này không còn dùng được'; end if;
  select data into d from public.cases where id = f.v_case for update;
  select (x.idx - 1)::int, x.t into i, old
    from jsonb_array_elements(coalesce(d->'tasks', '[]'::jsonb)) with ordinality as x(t, idx)
    where x.t->>'id' = p_task->>'id';
  if old is null then raise exception 'Không tìm thấy việc này'; end if;
  if old->>'owner' is distinct from f.v_member->>'id' then raise exception 'Việc này không giao cho bác'; end if;
  if (old - allowed) is distinct from (p_task - allowed) then raise exception 'Qua link chỉ đổi được trạng thái việc'; end if;
  if coalesce(p_task->>'status', '') not in ('doing', 'done', 'issue') then raise exception 'Trạng thái không hợp lệ'; end if;
  if old->>'status' = 'done' then raise exception 'Việc đã xong'; end if;
  d := jsonb_set(d, array['tasks', i::text], p_task);
  d := jsonb_set(d, '{history}', coalesce(d->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
         'at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
         'text', (f.v_member->>'name') || ' (qua link): ' || left(coalesce(nullif(trim(p_log), ''), 'cập nhật việc'), 300),
         'taskId', p_task->>'id')));
  update public.cases set data = d, version = version + 1 where id = f.v_case;
end $$;

revoke execute on function public.link_find(text) from public, anon, authenticated;
grant execute on function public.link_view(text) to anon, authenticated;
grant execute on function public.link_act(text, jsonb, text) to anon, authenticated;
