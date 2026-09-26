-- =====================================================================
-- TRỌN HIẾU · Góc bình an theo cấu trúc của Chủ dự án (26/09/2026)
--   Hai chuyên mục: Nghệ thuật sống · Nghệ thuật chết. Bài đánh số 01–05.
--   Quy chuẩn mỗi bài: Ảnh đại diện → Tiêu đề → Nội dung → Một phút nhìn lại.
-- Chạy SAU 0006. Chạy lại được. 10 bài của Chủ dự án nạp ở dạng NHÁP (Chủ dự án bấm Đăng).
-- =====================================================================

alter table public.articles add column if not exists category text;
alter table public.articles add column if not exists seq int;
alter table public.articles add column if not exists reflection text not null default '';
alter table public.articles drop constraint if exists articles_category_check;
alter table public.articles add constraint articles_category_check check (category is null or category in ('song', 'chet'));

insert into public.articles (id, slug, title, category, seq, milestone, summary, body, reflection) values

('ns-01', 'binh-an-khong-nam-o-hoan-canh', 'Bình an không nằm ở hoàn cảnh', 'song', 1, null,
 'Nếu bình an phụ thuộc vào hoàn cảnh, có lẽ chúng ta sẽ phải chờ rất lâu.',
$b$Có những lúc ta nghĩ:
“Khi có đủ tiền, tôi sẽ bình an.”
“Khi con cái trưởng thành, tôi sẽ bình an.”
“Khi mọi việc thuận lợi, tôi sẽ bình an.”

Nhưng cuộc đời hiếm khi hoàn toàn theo ý mình.
Hết việc này lại đến việc khác. Hết một điều để lo, chúng ta lại tìm thấy một điều khác để lo.

Bởi vậy, nếu bình an phụ thuộc vào hoàn cảnh, có lẽ chúng ta sẽ phải chờ rất lâu.

**Bình an trước hết là trạng thái của Tâm.**

Cùng một sự việc, có người tức giận, có người đau khổ, có người lại có thể bình tĩnh quan sát và tìm cách giải quyết.
Cảnh có thể giống nhau, nhưng cách mỗi người tiếp nhận cảnh lại khác nhau.

Chuyển hóa không phải là bắt cuộc đời ngừng biến động.
Chuyển hóa là khi ta bắt đầu nhận ra điều gì đang diễn ra bên trong mình:

- Tôi đang giận điều gì?
- Tôi đang sợ điều gì?
- Tôi đang muốn điều gì phải xảy ra theo ý mình?

Khi nhìn thấy được chính mình, ta bắt đầu có khoảng cách với cảm xúc thay vì lập tức bị cảm xúc dẫn đi.

Cuộc đời vẫn có những ngày nắng, ngày mưa.
Người đến rồi người đi.
Có được rồi có mất.

Nhưng giữa những đổi thay ấy, ta có thể học cách giữ cho mình một nơi để trở về.
Nơi ấy gọi là **Bình An**.$b$,
$r$Điều gì đang khiến bạn bất an hôm nay?
Đó thực sự là vấn đề của hoàn cảnh, hay còn có một mong muốn, nỗi sợ hoặc sự bám chấp nào bên trong bạn?$r$),

('ns-02', 'dung-doi-mat-di-moi-biet-minh-tung-co', 'Đừng đợi mất đi mới biết mình từng có', 'song', 2, null,
 'Nghệ thuật sống đôi khi chỉ đơn giản là nhận ra: hôm nay mình vẫn còn cơ hội để yêu thương.',
$b$Có những thứ khi còn ở bên ta, ta tưởng rằng đó là điều hiển nhiên.

Một bữa cơm mẹ nấu.
Một cuộc điện thoại của cha.
Tiếng con gọi từ phòng bên.
Một người vẫn ngồi cạnh mình mỗi tối.

Ta nghĩ ngày mai vẫn còn.
Vì vậy, lời cảm ơn để ngày mai nói.
Cuộc điện thoại để lúc khác gọi.
Bữa cơm để hôm nào rảnh sẽ về.

Cho đến một ngày, ta muốn quay lại một khoảnh khắc bình thường ấy nhưng không còn cơ hội nữa.

Con người thường đau không chỉ vì mất đi một người.
Đôi khi ta đau vì những điều đã có thể làm nhưng chưa làm, những lời đã có thể nói nhưng chưa nói.

Chuyển hóa tâm thức bắt đầu từ việc tỉnh thức với những gì đang hiện hữu.
Đừng chỉ nhìn vào thứ mình chưa có mà quên nhận ra những gì mình đang có.

Bởi vô thường không phải câu chuyện của ngày mai.
Mỗi ngày, mọi thứ đều đang thay đổi.

Vì vậy:

- Còn cha mẹ – hãy dành thời gian.
- Còn người thương – hãy biết trân trọng.
- Còn sức khỏe – hãy chăm sóc.
- Còn cơ hội – hãy sống tử tế.

Không cần đợi đến một cuộc chia ly mới học về sự trân trọng.
Nghệ thuật sống đôi khi chỉ đơn giản là nhận ra: **Hôm nay mình vẫn còn cơ hội để yêu thương.**$b$,
$r$Nếu hôm nay là lần cuối bạn được gặp một người mình yêu thương, có điều gì bạn muốn nói với họ?
Nếu có, tại sao không nói ngay hôm nay?$r$),

('ns-03', 'gieo-gi-trong-tam', 'Gieo gì trong tâm, đời sẽ dần biểu hiện điều ấy', 'song', 3, null,
 'Muốn khu vườn thay đổi, hãy bắt đầu từ hạt giống mình đang tưới.',
$b$Hãy hình dung bên trong mỗi người có một mảnh vườn.
Trong đó có rất nhiều hạt giống:

- Yêu thương
- Biết ơn
- Bao dung
- Tử tế

Nhưng cũng có:

- Giận dữ
- Đố kỵ
- Sợ hãi
- Tham cầu

Hạt giống nào được tưới thường xuyên, hạt giống ấy có điều kiện lớn lên.

Một suy nghĩ lặp lại nhiều lần có thể dẫn đến những hành động quen thuộc.
Hành động lặp lại tạo thành thói quen.
Thói quen lâu ngày góp phần tạo nên cách ta sống và cách ta phản ứng với cuộc đời.

Bởi vậy, chuyển hóa cuộc sống không nhất thiết bắt đầu bằng một điều thật lớn.
Có thể bắt đầu bằng việc quan sát:
**Hôm nay mình đang tưới hạt giống nào?**

Khi một người làm ta tức giận, ta có thể tiếp tục tưới sự giận dữ hoặc học cách nhìn sâu hơn để hiểu.
Khi gặp điều không như ý, ta có thể nuôi sự oán trách hoặc tìm bài học trong trải nghiệm ấy.

Mỗi lựa chọn nhỏ đều đang gieo một hạt giống.
Và cuộc đời ngày mai được tạo nên từ rất nhiều lựa chọn nhỏ của hôm nay.

Muốn khu vườn thay đổi, hãy bắt đầu từ hạt giống mình đang tưới.$b$,
$r$Trong những ngày gần đây, hạt giống nào đang được bạn tưới nhiều nhất?
Yêu thương, biết ơn, bình an… hay lo lắng, giận dữ và trách móc?$r$),

('ns-04', 'muon-thay-doi-nguoi-khac-hay-quay-ve-nhin-minh', 'Muốn thay đổi người khác, hãy quay về nhìn mình', 'song', 4, null,
 'Có những cuộc đời thay đổi không phải vì ta sửa được người khác, mà vì cuối cùng ta đã biết sửa chính mình.',
$b$Ta thường có một mong muốn rất tự nhiên:

Muốn chồng hiểu mình hơn.
Muốn vợ thay đổi.
Muốn con nghe lời.
Muốn cha mẹ sống theo cách mình cho là đúng.

Và khi họ không thay đổi, ta đau khổ.

Nhưng có một sự thật:
**Ta có thể tạo nhân duyên cho người khác thay đổi, nhưng không thể sống thay và quyết định thay họ.**

Điều ta thực sự có thể quay về làm chủ là cách mình nhìn, cách mình nói và cách mình hành động.

Thay vì hỏi:
“Tại sao anh ấy lại như vậy?”
Có thể thử hỏi:
“Điều gì khiến anh ấy nhìn sự việc theo cách đó?”

Thay vì:
“Tại sao con không nghe lời?”
Có thể hỏi:
“Điều gì đang thực sự diễn ra bên trong con?”

Khi góc nhìn thay đổi, cách ứng xử cũng thay đổi.
Và khi một nhân trong mối quan hệ thay đổi, những duyên xung quanh mối quan hệ ấy cũng có cơ hội thay đổi theo.

Bao dung không có nghĩa là chấp nhận mọi hành vi.
Bao dung là nhìn đủ sâu để hiểu mà không vội phán xét, đồng thời vẫn biết thiết lập những giới hạn cần thiết.

Có những cuộc đời thay đổi không phải vì ta sửa được người khác.
Mà vì cuối cùng, ta đã biết sửa chính mình.$b$,
$r$Có ai bạn đang rất muốn họ thay đổi?
Nếu hôm nay không yêu cầu họ thay đổi nữa, bạn có thể thay đổi điều gì ở chính mình để mối quan hệ tốt hơn?$r$),

('ns-05', 'song-mot-doi-khong-con-tiec-nuoi', 'Sống một đời để khi rời đi không còn quá nhiều điều tiếc nuối', 'song', 5, null,
 'Chính vì biết một ngày mọi thứ sẽ đi qua, ta càng biết trân trọng những gì đang hiện hữu.',
$b$Nếu biết cuộc đời mình là hữu hạn, chúng ta sẽ sống hôm nay như thế nào?

Có lẽ ta sẽ bớt một lần hơn thua.
Bớt một lời làm tổn thương người khác.
Bớt dành thời gian chứng minh mình đúng.
Và dành nhiều hơn cho những người thực sự quan trọng.

Sinh – lão – bệnh – tử là quy luật tự nhiên của đời người.
Không ai biết chính xác hành trình của mình dài bao lâu.
Nhưng ta có quyền lựa chọn cách mình sống trong khoảng thời gian đang có.

Một cuộc đời đáng giá không nhất thiết phải là một cuộc đời có thật nhiều.
Có khi chỉ cần:

- Đã yêu thương khi còn có thể.
- Đã biết ơn người từng giúp mình.
- Đã xin lỗi khi nhận ra mình sai.
- Đã sống tử tế với người bên cạnh.
- Đã làm những việc mình thấy có ý nghĩa.

Đến cuối cùng, có lẽ điều quan trọng không chỉ là:
“Tôi đã sống bao nhiêu năm?”
Mà còn là:
“Trong những năm tháng ấy, tôi đã thực sự sống như thế nào?”

Hiểu về cái chết không làm cuộc sống u buồn.
Ngược lại, chính vì biết một ngày mọi thứ sẽ đi qua, ta càng biết trân trọng những gì đang hiện hữu.$b$,
$r$Nếu nhìn lại cuộc đời mình từ điểm cuối của hành trình, điều gì bạn sẽ tiếc nhất nếu hôm nay vẫn chưa làm?
Có thể bắt đầu điều đó ngay từ bây giờ không?$r$),

('nc-01', 'hoc-ve-cai-chet-de-biet-cach-song', 'Học về cái chết để biết cách sống', 'chet', 1, null,
 'Hiểu về cái chết không phải để sợ chết, mà để tỉnh thức với sự sống.',
$b$Phần lớn chúng ta thích nói về sự bắt đầu.

Ngày một đứa trẻ chào đời.
Ngày tốt nghiệp.
Ngày kết hôn.
Ngày bắt đầu một công việc mới.

Nhưng ít người muốn nói về điểm cuối.
Cái chết thường trở thành điều chúng ta né tránh.

Nhưng né tránh không làm quy luật ấy biến mất.
Sinh – lão – bệnh – tử vẫn là một phần của đời sống.

Khi nhìn thẳng vào sự hữu hạn của đời người, ta có thể nhận ra một điều rất quan trọng:
**Thời gian của mình có giới hạn.**

Và khi thời gian có giới hạn, ta bắt đầu biết điều gì thật sự quan trọng.

Một cuộc tranh cãi có đáng kéo dài nhiều năm?
Một lời xin lỗi có cần khó đến vậy?
Cha mẹ còn khỏe, mình còn bao nhiêu bữa cơm có thể ngồi cùng?
Con còn nhỏ, mình còn bao nhiêu lần được con ôm?

Hiểu về cái chết không phải để sợ chết.
Mà để tỉnh thức với sự sống.

Bởi khi thật sự hiểu rằng một ngày mình và những người mình yêu thương đều phải rời đi, ta có thể bớt trì hoãn yêu thương.

Nghệ thuật chết, ở tầng sâu nhất, chính là một bài học về Nghệ thuật sống.$b$,
$r$Nếu thời gian là hữu hạn, điều gì đang chiếm quá nhiều thời gian của bạn nhưng thực ra không quan trọng?$r$),

('nc-02', 'vo-thuong-khong-co-cuoc-gap-nao-keo-dai-mai-mai', 'Vô thường – Không có cuộc gặp nào kéo dài mãi mãi', 'chet', 2, null,
 'Chấp nhận vô thường không làm tình yêu nhỏ đi. Nó khiến ta biết quý từng khoảnh khắc được ở bên nhau hơn.',
$b$Có gặp thì có chia.
Có sinh thì có diệt.
Có bắt đầu thì có kết thúc.

Ta hiểu điều đó bằng lý trí, nhưng khi một người thân yêu rời đi, trái tim vẫn đau.
Đó là điều rất con người.

Hiểu vô thường không phải để trở nên lạnh lùng.
Cũng không phải tự ép mình rằng:
“Mọi thứ vô thường nên không được buồn.”

Không.
Ta có thể buồn.
Có thể nhớ.
Có thể khóc.

Bởi đã từng yêu thương nên khi chia xa mới có khoảng trống.

Nhưng hiểu về vô thường giúp ta dần nhìn thấy:
Không điều gì tồn tại mãi trong một hình thức.

Một cuộc gặp rồi sẽ có lúc chia xa.
Một cơ thể sinh ra rồi sẽ già đi.
Một đời người bắt đầu rồi sẽ có ngày kết thúc.

Vì vậy, khi còn được gặp nhau, hãy hiện diện thật sự.
Khi còn được yêu thương, hãy yêu thương.
Khi còn có thể nói lời cảm ơn, hãy nói.

Chấp nhận vô thường không làm tình yêu nhỏ đi.
Nó khiến ta biết quý từng khoảnh khắc được ở bên nhau hơn.$b$,
$r$Có một người nào bạn vẫn nghĩ rằng “còn nhiều thời gian” nên đã lâu chưa dành thời gian thật sự cho họ không?$r$),

('nc-03', 'khi-nguoi-thuong-roi-di-xin-dung-bat-minh-phai-quen', 'Khi người thương rời đi, xin đừng bắt mình phải quên', 'chet', 3, 'sau-tang',
 'Ta không nhất thiết phải quên để bước tiếp. Ta có thể vừa nhớ, vừa tiếp tục sống một cuộc đời có ý nghĩa.',
$b$Khi mất đi một người quan trọng, đôi khi người ở lại được khuyên:
“Đừng buồn nữa.”
“Phải mạnh mẽ lên.”
“Hãy quên đi để sống tiếp.”

Nhưng có những người ta không cần phải quên.
Điều cần thay đổi có thể không phải là ký ức, mà là cách ta sống cùng ký ức ấy.

Những ngày đầu, một bức ảnh cũng có thể khiến ta khóc.
Một món ăn quen.
Một chiếc ghế trống.
Một số điện thoại không bao giờ còn gọi đến.

Đừng vội yêu cầu bản thân phải bình thường ngay lập tức.
Nỗi đau cũng cần thời gian.
Hãy cho mình được buồn, được nhớ và được đi qua mất mát theo nhịp riêng.

Rồi theo thời gian, ký ức có thể dần thay đổi.
Từ một điều chỉ cần nghĩ tới đã đau, trở thành một nơi để ta nhớ về tình yêu đã từng có.

Người đã mất không còn hiện diện theo cách cũ.
Nhưng những gì họ từng trao cho ta – một bài học, một cách sống, một câu nói, một tình yêu – vẫn có thể tiếp tục hiện diện trong cuộc đời người ở lại.

Ta không nhất thiết phải quên để bước tiếp.
Ta có thể vừa nhớ, vừa tiếp tục sống một cuộc đời có ý nghĩa.$b$,
$r$Nếu người bạn đang thương nhớ có thể nhìn thấy cuộc sống của bạn hôm nay, bạn nghĩ họ mong muốn bạn tiếp tục sống như thế nào?$r$),

('nc-04', 'mot-cuoc-tien-dua-tron-ven', 'Một cuộc tiễn đưa trọn vẹn', 'chet', 4, null,
 'Trọn một cuộc tiễn đưa – Vẹn một đời thương nhớ.',
$b$Khi một người rời khỏi cuộc đời, gia đình thường đứng trước rất nhiều việc phải lo:

- Nghi lễ
- Người thân
- Khách viếng
- Thông báo
- Tài chính
- Những thủ tục cần hoàn thành

Giữa hàng trăm việc ấy, đôi khi ta quên mất điều quan trọng nhất:
**Đây là những khoảnh khắc cuối cùng gia đình được cùng nhau tiễn một người thân yêu.**

Một cuộc tiễn đưa trọn vẹn không nhất thiết phải thật lớn.
Không nhất thiết phải thật nhiều hoa.
Không nhất thiết phải chứng minh điều gì với người ngoài.

Điều đáng quý hơn có thể là sự trang nghiêm, chu toàn và tình cảm chân thành của những người ở lại.

Nếu còn điều muốn nói, hãy nói.
Nếu còn lời cảm ơn, hãy gửi.
Nếu từng có điều chưa thể tha thứ, có lẽ đây cũng là lúc để lòng mình được nhẹ hơn.

Nghi thức có giá trị khi nó giúp con người thể hiện lòng biết ơn, sự tưởng nhớ và cùng nhau đi qua thời khắc chia ly.

Bởi cuối cùng, một cuộc tiễn đưa không chỉ dành cho người đã mất.
Nó còn giúp những người ở lại có một điểm khép lại để tiếp tục hành trình của mình.

**Trọn một cuộc tiễn đưa – Vẹn một đời thương nhớ.**$b$,
$r$Nếu một ngày phải tiễn một người mình yêu thương, điều gì đối với bạn mới thực sự làm nên một cuộc tiễn đưa trọn vẹn?$r$),

('nc-05', 'neu-mot-ngay-toi-phai-roi-di', 'Nếu một ngày tôi phải rời đi', 'chet', 5, null,
 'Để một ngày khép lại hành trình, thứ còn lại không chỉ là một đám tang, mà là một đời thương nhớ.',
$b$Có một câu hỏi ít người muốn tự hỏi:
**Nếu một ngày tôi phải rời đi, tôi muốn để lại điều gì?**

Không chỉ là nhà cửa.
Không chỉ là tiền bạc.
Không chỉ là những thứ mang tên mình.

Có lẽ còn một loại di sản khác.
Đó là cách những người từng sống cạnh ta nhớ về ta.

Một người cha có thể để lại cho con cách sống tử tế.
Một người mẹ có thể để lại cảm giác được yêu thương.
Một người thầy có thể để lại một lời dạy thay đổi cuộc đời học trò.
Một con người bình thường cũng có thể để lại rất nhiều hạt giống tốt trong những người từng gặp mình.

Cuối cùng, tài sản có thể được chia.
Đồ vật có thể cũ.
Tên tuổi rồi cũng có thể phai mờ.

Nhưng những điều ta đã gieo vào cuộc đời người khác đôi khi còn tiếp tục rất lâu.

Vì vậy, chuẩn bị cho cái chết không nhất thiết bắt đầu ở những ngày cuối đời.
Nó có thể bắt đầu ngay hôm nay bằng một câu hỏi:
Mình đang sống như thế nào?

Bởi cách đẹp nhất để chuẩn bị cho ngày phải rời đi có lẽ chính là:
Sống một cuộc đời mà khi nhìn lại, ta biết mình đã cố gắng yêu thương, biết ơn, cho đi và sống có ý nghĩa.

Để một ngày khép lại hành trình, thứ còn lại không chỉ là một đám tang.
Mà là một đời thương nhớ.$b$,
$r$Nếu cuộc đời bạn là một cuốn sách và hôm nay phải viết trang cuối, bạn muốn những người yêu thương nhớ nhất điều gì về mình?$r$)

on conflict (id) do nothing;
