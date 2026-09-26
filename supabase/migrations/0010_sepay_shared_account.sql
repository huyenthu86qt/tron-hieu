-- =====================================================================
-- TRỌN HIẾU · Tài khoản MB dùng chung với dự án khác (27/09/2026)
-- SePay báo MỌI khoản tiền vào tài khoản. Chỉ ghi nhận giao dịch của Trọn Hiếu:
--   có mã đơn DHxxxxxx trong nội dung, HOẶC đúng số tiền một gói đang bán (khách quên ghi mã → Admin gán tay).
-- Các khoản khác bỏ qua, không ghi vào “Giao dịch chưa khớp”.
-- Chạy SAU 0009. Chạy lại được.
-- =====================================================================
create or replace function public.sepay_webhook(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare amt bigint; content text;
begin
  if coalesce(p->>'transferType', '') <> 'in' then return jsonb_build_object('ignored', 'not incoming'); end if;
  if p->>'id' is null then raise exception 'Thiếu mã giao dịch SePay'; end if;
  amt := coalesce((p->>'transferAmount')::numeric, 0)::bigint;
  content := trim(coalesce(p->>'code', '') || ' ' || coalesce(p->>'content', '') || ' ' || coalesce(p->>'description', ''));
  if substring(upper(content) from 'DH[A-Z0-9]{6}') is null
     and not exists (select 1 from public.products where coalesce((data->>'active')::boolean, false) and (data->>'price')::bigint = amt) then
    return jsonb_build_object('ignored', 'not Tron Hieu');
  end if;
  return public.process_bank_tx('sepay:' || (p->>'id'), amt, content, p->>'accountNumber', 'SePay', p);
end $$;

revoke execute on function public.sepay_webhook(jsonb) from public, authenticated, anon;
grant execute on function public.sepay_webhook(jsonb) to service_role;
