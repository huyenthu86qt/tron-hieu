-- =====================================================================
-- TRỌN HIẾU · Phase 3d “Nghĩa tình”: Sổ tưởng nhớ (miễn phí cho mọi gia đình) + Góc bình an (bài viết của Admin)
-- Chạy SAU 0001–0005. Chạy lại được.
--
--  • Sổ tưởng nhớ: kỷ niệm của người trong đội (chỉ mình tôi / gia đình / công khai trên trang cáo phó),
--    lời tưởng nhớ khách gửi từ trang cáo phó → người đại diện duyệt rồi mới hiện. Không bình luận, không “thích”.
--  • Góc bình an: bài viết do Admin soạn; ai cũng đọc được bài đã đăng; không bình luận.
--  • Hai phần tách riêng: không đặt bài viết của app trong Sổ tưởng nhớ.
-- =====================================================================

-- ---------- Sổ tưởng nhớ ----------
create table if not exists public.memories (
  id text primary key default ('mm' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  case_id text not null references public.cases on delete cascade,
  author_id uuid references auth.users on delete set null,
  author_name text not null check (length(author_name) between 1 and 80),
  kind text not null default 'family' check (kind in ('family', 'guest')),
  body text not null check (length(body) between 1 and 4000),
  photo_path text,
  prompt text,
  visibility text not null default 'family' check (visibility in ('private', 'family', 'public')),
  status text not null default 'approved' check (status in ('approved', 'pending', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists memories_case on public.memories (case_id, created_at);
alter table public.memories enable row level security;

revoke insert, update, delete on public.memories from anon, authenticated;
grant select on public.memories to authenticated;
grant insert (case_id, author_id, author_name, kind, body, photo_path, prompt, visibility, status) on public.memories to authenticated;
grant update (body, photo_path, visibility) on public.memories to authenticated;
grant delete on public.memories to authenticated;

drop policy if exists p_mem_sel on public.memories;
create policy p_mem_sel on public.memories for select using (
  author_id = auth.uid()
  or (public.is_case_member(case_id) and visibility in ('family', 'public') and status = 'approved')
  or (public.is_case_owner(case_id) and kind = 'guest'));
drop policy if exists p_mem_ins on public.memories;
create policy p_mem_ins on public.memories for insert with check (
  public.is_case_member(case_id) and author_id = auth.uid() and kind = 'family' and status = 'approved');
drop policy if exists p_mem_upd on public.memories;
create policy p_mem_upd on public.memories for update using (author_id = auth.uid()) with check (author_id = auth.uid());
drop policy if exists p_mem_del on public.memories;
create policy p_mem_del on public.memories for delete using (author_id = auth.uid() or public.is_case_owner(case_id));

-- Người đại diện duyệt / ẩn lời tưởng nhớ của khách
create or replace function public.moderate_memory(p_id text, p_status text) returns void
language plpgsql security definer set search_path = public as $$
declare m public.memories;
begin
  select * into m from public.memories where id = p_id;
  if m.id is null then raise exception 'Không tìm thấy lời tưởng nhớ'; end if;
  if not public.is_case_owner(m.case_id) then raise exception 'Chỉ người đại diện gia đình duyệt được'; end if;
  if p_status not in ('approved', 'hidden') then raise exception 'Trạng thái không hợp lệ'; end if;
  update public.memories set status = p_status where id = p_id;
end $$;

-- Khách (không cần tài khoản) gửi lời tưởng nhớ từ trang cáo phó đã công khai → chờ gia đình duyệt
create or replace function public.submit_guest_memory(p_slug text, p_name text, p_body text) returns void
language plpgsql security definer set search_path = public as $$
declare v_case text;
begin
  select case_id into v_case from public.public_pages where slug = p_slug and published;
  if v_case is null then raise exception 'Trang không còn nhận lời tưởng nhớ'; end if;
  if length(trim(coalesce(p_name, ''))) < 1 or length(p_name) > 80 then raise exception 'Cần ghi tên (tối đa 80 ký tự)'; end if;
  if length(trim(coalesce(p_body, ''))) < 2 or length(p_body) > 1000 then raise exception 'Lời tưởng nhớ từ 2 đến 1.000 ký tự'; end if;
  if (select count(*) from public.memories where case_id = v_case and status = 'pending') >= 200 then
    raise exception 'Gia đình đang có nhiều lời tưởng nhớ chờ xem — vui lòng gửi lại sau';
  end if;
  insert into public.memories (case_id, author_id, author_name, kind, body, visibility, status)
  values (v_case, auth.uid(), trim(p_name), 'guest', trim(p_body), 'public', 'pending');
end $$;

-- Lời tưởng nhớ đã duyệt, công khai trên trang cáo phó
create or replace function public.public_memories(p_slug text)
returns table (author_name text, body text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select m.author_name, m.body, m.created_at from public.memories m
  join public.public_pages pp on pp.case_id = m.case_id and pp.slug = p_slug and pp.published
  where m.visibility = 'public' and m.status = 'approved'
  order by m.created_at
$$;

revoke execute on function public.moderate_memory(text, text) from public, anon;
grant execute on function public.moderate_memory(text, text) to authenticated;
grant execute on function public.submit_guest_memory(text, text, text) to anon, authenticated;
grant execute on function public.public_memories(text) to anon, authenticated;

-- ---------- Góc bình an ----------
create table if not exists public.articles (
  id text primary key,
  slug text not null unique,
  title text not null,
  summary text not null default '',
  cover_url text,
  body text not null default '',
  topics text[] not null default '{}',
  milestone text check (milestone in ('d49', 'd100', 'gio', 'sau-tang')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.articles enable row level security;
revoke insert, update, delete on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;

drop policy if exists p_art_sel on public.articles;
create policy p_art_sel on public.articles for select using ((status = 'published' and coalesce(publish_at, now()) <= now()) or public.is_admin());
drop policy if exists p_art_ins on public.articles;
create policy p_art_ins on public.articles for insert with check (public.is_admin());
drop policy if exists p_art_upd on public.articles;
create policy p_art_upd on public.articles for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists p_art_del on public.articles;
create policy p_art_del on public.articles for delete using (public.is_admin());

-- Ảnh bìa bài viết: kho công khai (ai cũng xem), chỉ Admin tải lên / xóa
insert into storage.buckets (id, name, public, file_size_limit) values ('article-images', 'article-images', true, 5242880)
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit;
drop policy if exists th_art_img_add on storage.objects;
create policy th_art_img_add on storage.objects for insert to authenticated with check (bucket_id = 'article-images' and public.is_admin());
drop policy if exists th_art_img_del on storage.objects;
create policy th_art_img_del on storage.objects for delete to authenticated using (bucket_id = 'article-images' and public.is_admin());
drop policy if exists th_art_img_read on storage.objects;
create policy th_art_img_read on storage.objects for select to authenticated using (bucket_id = 'article-images' and public.is_admin());

-- ---------- 5 bài viết mẫu (NHÁP — Chủ dự án đọc, sửa, rồi tự bấm Đăng) ----------
insert into public.articles (id, slug, title, summary, milestone, topics, body) values
('a-49-ngay', 'y-nghia-le-49-ngay', 'Ý nghĩa lễ cúng 49 ngày',
 'Vì sao nhiều gia đình Việt làm lễ 49 ngày, và làm sao để lễ được trọn nghĩa mà không nặng nề.',
 'd49', '{Phong tục}',
$b$Sau tang lễ, nhiều gia đình Việt vẫn giữ nếp cúng thất: mỗi bảy ngày một lần, cho đến ngày thứ bốn mươi chín. Lễ 49 ngày (còn gọi là chung thất) là mốc khép lại chuỗi ngày ấy.

## Lễ 49 ngày từ đâu mà có

Theo quan niệm của Phật giáo, trong bốn mươi chín ngày sau khi mất, người đã khuất đang ở giữa hai cảnh giới và cần được con cháu hồi hướng công đức, cầu nguyện để yên ổn ra đi. Vì vậy lễ 49 ngày thường gắn với tụng kinh, cầu siêu, làm việc thiện.

Với gia đình theo Công giáo, những mốc tương tự là lễ cầu hồn 7 ngày và 30 ngày. Với gia đình không theo tôn giáo, đây vẫn là dịp con cháu quây quần, thắp nén hương, nhắc lại những điều người đã khuất để lại.

## Làm sao để lễ được trọn nghĩa

- **Chọn quy mô vừa sức.** Một mâm cơm tươm tất, ấm cúng quý hơn một bữa tiệc lớn khiến cả nhà mệt mỏi, vay mượn.
- **Mời đúng người.** Họ hàng gần, những người đã giúp đỡ trong những ngày tang lễ.
- **Để lễ là dịp nhớ, không chỉ là dịp cúng.** Mỗi người kể một kỷ niệm, đọc lại lời dặn của người đã khuất, hoặc viết vài dòng vào Sổ tưởng nhớ.
- **Làm một việc thiện nhỏ** theo tinh thần của người đã khuất: tặng sách, góp một phần cho người khó khăn.

## Sau 49 ngày

Nhiều gia đình coi đây là lúc bắt đầu sắp xếp lại cuộc sống: thu dọn dần đồ đạc, hoàn tất giấy tờ, trở lại công việc. Không có khuôn mẫu nào đúng cho tất cả. Nỗi nhớ không kết thúc ở ngày thứ bốn mươi chín, nhưng từ đây, nó có thể dần trở nên nhẹ nhàng hơn.

*Phong tục mỗi vùng, mỗi tôn giáo có khác nhau. Gia đình nên hỏi thêm người lớn tuổi trong họ hoặc thầy, cha xứ nơi mình sinh hoạt.*$b$),

('a-100-ngay', 'le-100-ngay-tot-khoc', 'Lễ 100 ngày: thôi khóc, để thương nhớ ở lại một cách bình an',
 'Lễ 100 ngày còn gọi là lễ tốt khốc – “thôi khóc”. Ý nghĩa của mốc này với người ở lại.',
 'd100', '{Phong tục,Người ở lại}',
$b$Một trăm ngày sau khi người thân mất, nhiều gia đình làm lễ cúng 100 ngày, trong dân gian còn gọi là lễ **tốt khốc**, nghĩa là “thôi khóc”.

## Thôi khóc không phải là thôi nhớ

Người xưa đặt ra mốc này không để bắt con cháu quên đi, mà như một lời nhắn nhủ: đã đến lúc để nước mắt lắng xuống, để người ở lại sống tiếp cho tròn, vì đó cũng là mong mỏi của người đã khuất.

Có người đến ngày thứ một trăm vẫn thấy lòng nặng trĩu. Điều đó bình thường. Mỗi người đi qua mất mát theo một nhịp riêng.

## Gợi ý cho lễ 100 ngày

- Một mâm cơm gia đình, mời những người thân thiết nhất.
- Cùng nhau xem lại ảnh cũ, kể những chuyện vui về người đã khuất. Tiếng cười lúc này không có gì thất lễ.
- Nhìn lại những việc còn dở: giấy tờ, đồ đạc, lời hứa với người đã khuất. Chia nhau làm tiếp.
- Hỏi thăm người thân gần gũi nhất với người đã khuất (vợ/chồng, cha mẹ già). Họ thường là người buồn lâu nhất và ít nói ra nhất.

## Sau lễ 100 ngày

Nhiều nhà thôi cúng cơm hằng ngày, chỉ thắp hương ngày rằm, mùng một. Nếp nhà mỗi nơi một khác; điều quan trọng là cả nhà cùng thống nhất và thấy thanh thản.

*Phong tục mỗi vùng, mỗi tôn giáo có khác nhau. Gia đình nên hỏi thêm người lớn tuổi trong họ.*$b$),

('a-gio-dau', 'gio-dau-mot-nam-nhin-lai', 'Giỗ đầu: một năm nhìn lại',
 'Giỗ đầu (tiểu tường) là mốc trọn một năm. Vài gợi ý để ngày giỗ vừa trang trọng vừa ấm áp.',
 'gio', '{Phong tục,Người ở lại}',
$b$Giỗ đầu, còn gọi là **tiểu tường**, là lễ tưởng niệm tròn một năm ngày mất, thường tính theo ngày âm lịch. Nhiều gia đình coi đây là ngày giỗ quan trọng, họ hàng về đông đủ.

## Một năm đã qua

Một năm với đủ bốn mùa, đủ những ngày lễ Tết đầu tiên vắng một người. Ai đã đi qua đều biết: những “lần đầu” ấy thường khó hơn cả ngày tang lễ. Ngày giỗ đầu vì thế không chỉ để cúng, mà còn để cả nhà ngồi lại, nhìn nhau và thấy mình đã cùng đi qua.

## Gợi ý chuẩn bị

- **Xem ngày âm lịch sớm** và báo cho họ hàng ở xa để kịp sắp xếp.
- **Mâm cỗ vừa sức**, ưu tiên những món người đã khuất yêu thích.
- **Một góc kỷ niệm**: đặt ảnh, vài kỷ vật; in vài trang từ Sổ tưởng nhớ để mọi người cùng đọc.
- **Mời người đã giúp đỡ** trong những ngày tang lễ: hàng xóm, bạn bè, ban lễ tang. Một lời cảm ơn sau một năm luôn được trân trọng.

## Những mốc sau giỗ đầu

Theo nếp xưa, sau giỗ đầu còn có giỗ hết (**đại tường**, tròn hai năm) và lễ **đàm tế** để trừ phục, sau đó là giỗ thường hằng năm. Ngày nay nhiều gia đình giản lược; điều cốt lõi vẫn là lòng thành và sự sum họp.

*Phong tục mỗi vùng, mỗi tôn giáo có khác nhau. Gia đình nên hỏi thêm người lớn tuổi trong họ.*$b$),

('a-giay-to', 'viec-giay-to-sau-tang-le', 'Những việc giấy tờ cần làm sau tang lễ',
 'Khai tử, chế độ bảo hiểm xã hội, tài khoản, thừa kế… Danh sách để gia đình không bỏ sót.',
 'sau-tang', '{Thủ tục}',
$b$Sau tang lễ, gia đình còn một số việc giấy tờ. Không cần làm hết trong một ngày, nhưng nên lập danh sách và chia nhau làm.

## 1. Đăng ký khai tử

- Theo Luật Hộ tịch, trong **15 ngày** kể từ ngày mất, vợ/chồng, con, cha mẹ hoặc người thân thích có trách nhiệm đi đăng ký khai tử.
- Thường làm tại **Ủy ban nhân dân cấp xã** nơi người mất cư trú cuối cùng. Mang theo giấy báo tử (bệnh viện hoặc cơ quan có thẩm quyền cấp) và giấy tờ tùy thân của người đi khai.
- Nên xin **nhiều bản trích lục khai tử**: hầu hết các thủ tục sau đều cần.

## 2. Bảo hiểm xã hội, lương hưu

- Nếu người mất đang đóng hoặc đang hưởng bảo hiểm xã hội (lương hưu, trợ cấp), gia đình liên hệ **cơ quan bảo hiểm xã hội** nơi người mất đang hưởng hoặc tham gia để hỏi về **trợ cấp mai táng** và **chế độ tử tuất**, đồng thời báo để dừng chi trả lương hưu.
- Nếu người mất là người có công, cán bộ hưu trí, hỏi thêm phòng Lao động – Thương binh và Xã hội hoặc cơ quan cũ về các chế độ liên quan.

## 3. Ngân hàng, điện nước, thuê bao

- Báo cho ngân hàng nơi người mất có tài khoản, thẻ, khoản vay. Tiền trong tài khoản thường chỉ được rút sau khi làm thủ tục thừa kế.
- Chuyển tên hoặc cắt các hợp đồng điện, nước, internet, số điện thoại.

## 4. Thừa kế

- Nếu có di chúc: giữ bản gốc, xem nơi lập và người làm chứng.
- Nếu không có di chúc: những người thừa kế theo pháp luật cùng thỏa thuận; thường làm **văn bản khai nhận hoặc thỏa thuận phân chia di sản** tại tổ chức hành nghề công chứng, rồi mới sang tên nhà đất, xe, tài khoản.
- Việc thừa kế dễ nảy sinh hiểu lầm. Nói chuyện sớm, rõ ràng, có người làm chứng là cách giữ hòa khí trong nhà.

## Mẹo nhỏ

Lưu bản chụp mọi giấy tờ vào mục **Tài liệu** của đám hiếu để cả nhà tìm lại khi cần.

*Bài viết chỉ để tham khảo. Quy định có thể thay đổi và khác nhau theo từng trường hợp; gia đình vui lòng hỏi lại cơ quan có thẩm quyền, luật sư hoặc công chứng viên.*$b$),

('a-cham-soc', 'cham-soc-ban-than-sau-mat-mat', 'Chăm sóc bản thân sau mất mát',
 'Buồn, mệt, cáu gắt, trống rỗng… đều là phản ứng bình thường. Vài điều nhỏ giúp người ở lại đi qua những ngày khó.',
 'sau-tang', '{Người ở lại}',
$b$Những ngày tang lễ, người ta thường gồng mình lo việc. Khi khách về hết, căn nhà yên lặng, nỗi buồn mới thật sự ùa đến.

## Những cảm xúc bình thường

Buồn, mệt, mất ngủ, khó tập trung, cáu gắt, thấy có lỗi, thấy trống rỗng, thậm chí nhẹ nhõm (nếu người thân đã ốm đau lâu)… Tất cả đều là phản ứng bình thường của tang thương. Không có cách buồn nào là “đúng”, và cũng không có hạn chót nào để hết buồn.

## Vài điều nhỏ có ích

- **Giữ nhịp sinh hoạt cơ bản:** ăn đủ bữa, uống đủ nước, ngủ đúng giờ, ra ngoài đi bộ một chút mỗi ngày.
- **Nói ra:** với một người thân, một người bạn, hoặc viết vào Sổ tưởng nhớ. Gọi tên nỗi nhớ thường giúp nó nhẹ bớt.
- **Nhận sự giúp đỡ:** khi ai đó hỏi “cần gì không”, hãy nói một việc cụ thể — nấu giúp một bữa, đón con giúp một hôm.
- **Chưa vội quyết định lớn** trong vài tháng đầu: bán nhà, chuyển chỗ ở, đổi việc.
- **Để ý người lớn tuổi và trẻ nhỏ trong nhà.** Họ buồn theo cách khác và ít nói ra hơn.

## Khi nào nên tìm người hỗ trợ

Nếu sau nhiều tháng anh/chị vẫn không thể sinh hoạt bình thường, không ăn ngủ được, hoặc có ý nghĩ làm hại bản thân, hãy tìm đến bác sĩ hoặc chuyên gia tâm lý. Trường hợp khẩn cấp, gọi ngay **115** hoặc đến cơ sở y tế gần nhất.

Thương nhớ là cách tình yêu ở lại. Chăm sóc cho chính mình cũng là một cách trọn nghĩa với người đã khuất.

*Bài viết mang tính chia sẻ, không thay thế tư vấn y tế hay tâm lý.*$b$)
on conflict (id) do nothing;
