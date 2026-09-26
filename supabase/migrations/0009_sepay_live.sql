-- =====================================================================
-- TRỌN HIẾU · Phase 4 · Nhận giao dịch thật từ SePay (27/09/2026)
--   - process_bank_tx: logic khớp chung cho giả lập và giao dịch thật
--     (mã đơn DHxxxxxx trong nội dung + đúng số tiền + đúng tài khoản nhận + đơn còn hạn)
--   - sepay_webhook: CHỈ service_role gọi được (Edge Function sepay-webhook đã kiểm khóa API)
--   - admin_sepay_go_live: Admin chuyển sang chạy thật, dọn đơn/giao dịch thử (Chủ dự án chốt 26/09/2026)
-- Chạy SAU 0001–0008. Chạy lại được.
-- =====================================================================

create or replace function public.process_bank_tx(p_provider_id text, p_amount bigint, p_content text, p_account text, p_actor text, p_raw jsonb)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare st jsonb; v_code text; o public.orders; tx_status text := 'unmatched'; reason text; tid text; want_acct text;
begin
  if exists (select 1 from public.bank_txs where provider_tx_id = p_provider_id) then
    return jsonb_build_object('duplicate', true);
  end if;
  select data into st from public.app_settings where id = 1;
  want_acct := nullif(regexp_replace(coalesce(st->'sepay'->'account'->>'number', ''), '\s', '', 'g'), '');
  v_code := substring(upper(coalesce(p_content, '')) from 'DH[A-Z0-9]{6}');
  select * into o from public.orders where orders.code = v_code;
  if want_acct is not null and p_account is not null and regexp_replace(p_account, '\s', '', 'g') <> want_acct then reason := 'Tiền vào tài khoản khác tài khoản nhận đã cài';
  elsif o.code is null then reason := 'Không tìm thấy mã đơn trong nội dung';
  elsif o.status <> 'pending' then reason := 'Đơn không còn ở trạng thái chờ thanh toán';
  elsif (o.data->>'expiresAt')::timestamptz < now() then reason := 'Đơn đã hết hạn';
  elsif p_amount <> o.amount then reason := case when p_amount < o.amount then 'Thiếu tiền' else 'Thừa tiền' end;
  else tx_status := 'matched';
  end if;
  tid := 'tx' || substr(md5(random()::text || clock_timestamp()::text), 1, 10);
  insert into public.bank_txs (id, provider_tx_id, status, order_code, data) values (tid, p_provider_id, tx_status, o.code,
    jsonb_strip_nulls(jsonb_build_object('id', tid, 'providerTxId', p_provider_id, 'amount', p_amount, 'content', p_content,
      'account', coalesce(p_account, want_acct, 'THU'), 'at', now(), 'status', tx_status, 'orderId', o.code, 'reason', reason,
      'source', p_actor, 'raw', p_raw)));
  if tx_status = 'matched' then
    update public.orders set status = 'paid', data = data || jsonb_build_object('status', 'paid', 'paidAt', now(), 'txId', tid) where orders.code = o.code;
    perform public.apply_paid_order(o.code);
    insert into public.audit_log (actor, action, target, detail) values (p_actor, 'Khớp giao dịch', o.code, p_amount || ' đ');
  else
    insert into public.audit_log (actor, action, target, detail) values (p_actor, 'Giao dịch chưa khớp', p_provider_id, reason);
  end if;
  return jsonb_build_object('duplicate', false, 'status', tx_status, 'reason', reason, 'order', o.code);
end $$;

-- Giả lập (chỉ môi trường thử) dùng chung logic khớp
create or replace function public.simulate_bank_tx(p_provider_id text, p_amount bigint, p_content text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare st jsonb;
begin
  if auth.uid() is null then raise exception 'Cần đăng nhập'; end if;
  select data into st from public.app_settings where id = 1;
  if st->'sepay'->>'env' <> 'test' then raise exception 'Chỉ giả lập được ở môi trường thử'; end if;
  return public.process_bank_tx('sim:' || p_provider_id, p_amount, p_content, null, 'SePay (giả lập)', null);
end $$;

-- Webhook SePay (đã được Edge Function kiểm khóa API). Chỉ tiền VÀO mới xét.
create or replace function public.sepay_webhook(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare amt bigint; content text;
begin
  if coalesce(p->>'transferType', '') <> 'in' then return jsonb_build_object('ignored', 'not incoming'); end if;
  if p->>'id' is null then raise exception 'Thiếu mã giao dịch SePay'; end if;
  amt := coalesce((p->>'transferAmount')::numeric, 0)::bigint;
  content := trim(coalesce(p->>'code', '') || ' ' || coalesce(p->>'content', '') || ' ' || coalesce(p->>'description', ''));
  return public.process_bank_tx('sepay:' || (p->>'id'), amt, content, p->>'accountNumber', 'SePay', p);
end $$;

-- Chuyển sang chạy thật: dọn đơn & giao dịch thử (giao dịch thật “sepay:” và đơn đã trả bằng giao dịch thật được giữ)
create or replace function public.admin_sepay_go_live() returns jsonb
language plpgsql security definer set search_path = public as $$
declare n_tx int; n_ord int;
begin
  if not public.is_admin() then raise exception 'Chỉ Admin'; end if;
  with d as (
    delete from public.orders o
    where not exists (select 1 from public.bank_txs t where t.order_code = o.code and t.provider_tx_id like 'sepay:%' and t.status = 'matched')
      and coalesce(o.data->>'note', '') not like 'Gán tay:%'
    returning 1) select count(*) into n_ord from d;
  with d as (delete from public.bank_txs where provider_tx_id not like 'sepay:%' returning 1) select count(*) into n_tx from d;
  update public.app_settings set data = jsonb_set(data, '{sepay,env}', '"live"') where id = 1;
  perform public.log_audit('Chuyển SePay sang chạy thật', 'SePay', format('Dọn %s đơn thử, %s giao dịch thử', n_ord, n_tx));
  return jsonb_build_object('orders', n_ord, 'txs', n_tx);
end $$;

revoke execute on function public.process_bank_tx(text, bigint, text, text, text, jsonb) from public, authenticated, anon;
revoke execute on function public.sepay_webhook(jsonb) from public, authenticated, anon;
grant execute on function public.sepay_webhook(jsonb) to service_role;
grant execute on function public.simulate_bank_tx(text, bigint, text) to authenticated;
grant execute on function public.admin_sepay_go_live() to authenticated;
