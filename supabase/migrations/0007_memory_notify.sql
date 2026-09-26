-- =====================================================================
-- TRỌN HIẾU · Sổ tưởng nhớ: báo nhẹ trong chuông Thông báo của gia đình
-- Chạy SAU 0006. Chạy lại được.
--  • Người trong đội viết dòng “Gia đình” / “Công khai” → lịch sử đám hiếu ghi “… vừa viết vào Sổ tưởng nhớ”.
--  • Dòng “Chỉ mình tôi”: không báo ai.
--  • Khách gửi lời tưởng nhớ → báo “Có lời tưởng nhớ mới từ khách, chờ gia đình xem” (không lộ nội dung).
-- =====================================================================

create or replace function public.memories_notify() returns trigger
language plpgsql security definer set search_path = public as $$
declare t text;
begin
  if new.kind = 'family' and new.visibility = 'private' then return null; end if;
  t := case when new.kind = 'guest' then 'Có lời tưởng nhớ mới từ khách viếng, chờ gia đình xem'
            else new.author_name || ' vừa viết vào Sổ tưởng nhớ' end;
  perform set_config('tronhieu.system', '1', true);
  update public.cases set
    data = jsonb_set(data, '{history}', coalesce(data->'history', '[]'::jsonb) || jsonb_build_array(jsonb_build_object(
      'at', to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'text', t, 'path', 'so-tuong-nho'))),
    version = version + 1
  where id = new.case_id;
  perform set_config('tronhieu.system', '', true);
  return null;
end $$;

drop trigger if exists memories_notify on public.memories;
create trigger memories_notify after insert on public.memories for each row execute function public.memories_notify();
revoke execute on function public.memories_notify() from public, anon, authenticated;
