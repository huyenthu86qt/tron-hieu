-- =====================================================================
-- TRỌN HIẾU · Danh bạ tự lớn lên từ các gia đình (lớp 3)
-- Chạy SAU 0001, 0002. Chạy lại được.
--
-- Admin KHÔNG đọc nội dung đám hiếu. Hàm này chỉ trả các nhà cung cấp mà gia đình tự thêm
-- VÀ đồng ý giới thiệu (share = true): tên, số điện thoại, hạng mục, địa chỉ nhà cung cấp,
-- và dấu hiệu dùng thật (đã chọn / cam kết / nghiệm thu / số sự cố).
-- Không trả mã đám hiếu, tên người mất, tên gia đình, ghi chú riêng.
-- =====================================================================

create or replace function public.admin_shared_family_vendors()
returns table (name text, phone text, cats jsonb, address text, used boolean, committed boolean, accepted boolean, incidents int, at timestamptz)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  return query
  select fv->>'name', fv->>'phone', coalesce(fv->'cats', '[]'::jsonb), coalesce(fv->>'address', ''),
         coalesce(u.used, false), coalesce(u.committed, false), coalesce(u.accepted, false), coalesce(u.incidents, 0),
         c.updated_at
  from public.cases c
  cross join lateral jsonb_array_elements(coalesce(c.data->'familyVendors', '[]'::jsonb)) fv
  left join lateral (
    select count(*) > 0 as used,
           bool_or(cv.value->>'status' = 'committed') as committed,
           bool_or(cv.value ? 'acceptedAt') as accepted,
           coalesce(sum(jsonb_array_length(coalesce(cv.value->'incidents', '[]'::jsonb))), 0)::int as incidents
    from jsonb_each(case when jsonb_typeof(c.data->'vendors') = 'object' then c.data->'vendors' else '{}'::jsonb end) cv
    where (cv.value->>'family')::boolean is true and cv.value->>'vendorId' = fv->>'id'
  ) u on true
  where (fv->>'share')::boolean is true
    and length(regexp_replace(coalesce(fv->>'phone', ''), '\D', '', 'g')) >= 9;
end $$;

revoke execute on function public.admin_shared_family_vendors() from public, anon;
grant execute on function public.admin_shared_family_vendors() to authenticated;
