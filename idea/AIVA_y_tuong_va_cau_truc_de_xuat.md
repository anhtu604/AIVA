# AIVA – Tổng hợp ý tưởng và cấu trúc đề xuất (bản cập nhật)

## 1. Tóm tắt định vị AIVA

AIVA không nên được nhìn như một chatbot đơn lẻ. Về mặt nghiệp vụ, AIVA là một **nền tảng trợ lý AI chuyên biệt cho HIV/AIDS**, vận hành theo mô hình **đa người dùng, đa vai trò, đa nhiệm vụ**.

Nền tảng này phục vụ đồng thời ba lớp nhu cầu lớn:

- **Không gian tư vấn kín đáo cho người có nguy cơ cao**
- **Không gian hỗ trợ công việc cho cán bộ/nhân viên trong hệ HIV/AIDS**
- **Không gian hỗ trợ công nghệ thông tin và các phần mềm đang vận hành cho toàn bộ Staff**

Điểm khác biệt cốt lõi của AIVA là kết hợp được năm lớp giá trị trong cùng một nền tảng:

- quản trị tài khoản và phân quyền nhiều cấp
- huấn luyện tri thức bởi Trainer
- hỗ trợ hội thoại theo đúng vai trò
- điều hướng người dùng tới dịch vụ phù hợp khi có sự đồng ý chia sẻ thông tin
- hỗ trợ vận hành số, phần mềm và quy trình số cho toàn bộ Staff

## 2. Nguyên tắc thiết kế cốt lõi

- Tách biệt không gian cộng đồng và không gian nghiệp vụ để tránh lẫn mục tiêu sử dụng.
- Luôn ưu tiên bảo mật, chỉ thu thập hoặc chia sẻ dữ liệu khi người dùng đồng ý rõ ràng.
- Trainer quyết định tri thức và hành vi phản hồi của AI theo từng nhóm người dùng.
- Staff dùng AI như công cụ hỗ trợ công việc, không thay thế quyết định pháp lý hoặc quyết định lâm sàng cuối cùng.
- AIVA phải tạo ra hành động tiếp theo rõ ràng: tư vấn, điều hướng, tiếp nhận, xử lý và theo dõi ca.
- AI phải có khả năng nhận biết khi **thiếu tài liệu, thiếu bối cảnh hoặc có mâu thuẫn trong tri thức**, từ đó chủ động hỏi ngược Trainer để tránh hỗ trợ sai cho người dùng hoặc Staff.

## 3. Cấu trúc tổng thể theo 5 lớp

| Lớp | Tên lớp | Vai trò nghiệp vụ |
|---|---|---|
| 1 | Cổng vào nền tảng | Phân luồng ngay từ đầu: User, Staff, Admin/Trainer |
| 2 | Quản trị người dùng và quyền | Tạo tài khoản, gán vai trò, gán địa bàn, gán nhóm chức năng |
| 3 | Các trợ lý AI theo vai trò | AIVA Care, CBO, Testing, Treatment, Surveillance, Management, Communications, IT Support |
| 4 | Điều hướng và phối hợp dịch vụ | Xin đồng ý chia sẻ, chọn địa bàn, chuyển ca tới đầu mối phù hợp |
| 5 | Giám sát chất lượng và an toàn | Kiểm soát nội dung nhạy cảm, phản hồi chất lượng, nhật ký đồng ý chia sẻ, phát hiện thiếu tri thức cần hỏi Trainer |

## 4. Mô hình người dùng và vai trò

| Nhóm | Vai trò | Chức năng chính | Phạm vi điển hình |
|---|---|---|---|
| Quản trị | Admin TW | Quản trị toàn hệ thống, tạo admin cấp dưới, quản lý danh mục cơ sở hỗ trợ | Toàn quốc |
| Quản trị | Admin tỉnh | Quản lý tài khoản trong địa bàn, theo dõi ca điều hướng về địa phương | Theo tỉnh/địa bàn |
| Tri thức | Trainer | Nạp tài liệu, dạy AI, tạo tình huống mẫu, trả lời câu hỏi ngược của AI, kiểm định chất lượng phản hồi | Theo nhóm AI được phân công |
| Nghiệp vụ | Staff | Dùng AI để phục vụ đúng công việc được giao theo từng nhánh chức năng | Theo vai trò và địa bàn |
| Cộng đồng | User | Không cần đăng nhập; được tư vấn HIV/STIs; chỉ chia sẻ thông tin khi đồng ý | Ẩn danh hoặc bán ẩn danh |

### 4.1. Các nhánh Staff cần có

- **CBO**: hỗ trợ cộng đồng, đồng đẳng viên và tiếp nhận ca khi người dùng đồng ý chia sẻ.
- **VCT/HTC**: hỗ trợ tư vấn xét nghiệm, sàng lọc và tiếp nhận ca liên quan xét nghiệm.
- **OPC**: hỗ trợ công việc liên quan điều trị ARV và tư vấn điều trị ở mức phù hợp.
- **Phòng XNKĐ**: hỗ trợ công tác xét nghiệm khẳng định HIV.
- **Giám sát dịch (M&E, SI, CS, …)**: hỗ trợ chỉ số, bảng biểu, nhận định tình hình dịch, báo cáo giám sát.
- **Quản lý**: hỗ trợ tổng hợp nhận định, nội dung điều hành, định hướng chiến lược và chuẩn bị họp.
- **Truyền thông**: hỗ trợ xây dựng tài liệu truyền thông, thông điệp, FAQ, dàn ý truyền thông và sản phẩm phổ biến kiến thức phòng, chống HIV/AIDS.
- **Hỗ trợ CNTT / phần mềm vận hành**: hỗ trợ sử dụng hệ thống, quy trình thao tác số, nhập liệu, xuất báo cáo, FAQ lỗi thường gặp và chuẩn hóa vận hành số.

### 4.2. Hai lớp năng lực của Staff

**Lớp 1 – Nghiệp vụ chuyên môn theo vai trò**
- CBO
- VCT/HTC
- OPC
- XNKĐ
- Giám sát dịch
- Quản lý
- Truyền thông

**Lớp 2 – Năng lực dùng chung cho mọi Staff**
- tra cứu tài liệu nghiệp vụ
- soạn thảo công việc
- hỗ trợ báo cáo
- hỗ trợ truyền thông
- **hỗ trợ công nghệ thông tin và các phần mềm đang vận hành**

## 5. Cấu trúc các không gian trợ lý AI

| Không gian AI | Đối tượng | Mục tiêu | Đầu ra điển hình |
|---|---|---|---|
| AIVA Care | Người có nguy cơ cao | Tư vấn như một người bạn, hỗ trợ tâm lý, đánh giá nguy cơ sơ bộ, điều hướng dịch vụ | Khuyến nghị hành động, hướng dẫn xét nghiệm/PEP/PrEP, chuyển tuyến khi được đồng ý |
| AIVA CBO | Nhóm cộng đồng | Hỗ trợ tiếp cận cộng đồng, tư vấn và theo dõi ca được chuyển sang | Kịch bản tư vấn, gợi ý xử lý, tóm tắt ca |
| AIVA Testing | VCT/HTC, XNKĐ | Hỗ trợ xét nghiệm, quy trình và tư vấn liên quan sàng lọc/khẳng định | FAQ, kịch bản tư vấn, nội dung quy trình |
| AIVA Treatment | OPC | Hỗ trợ kiến thức điều trị ARV và tác vụ nghiệp vụ liên quan | Tóm tắt tài liệu, giải thích khái niệm, nội dung tư vấn cơ bản |
| AIVA Surveillance | M&E, SI, CS | Hỗ trợ giám sát dịch, giải thích chỉ số, đọc bảng biểu, nhận định sơ bộ | Nhận định tình hình, giải thích chỉ số, khung báo cáo |
| AIVA Management | Lãnh đạo/quản lý | Chuyển dữ liệu kỹ thuật thành góc nhìn điều hành và chiến lược | Bản tóm tắt điều hành, ý chính cuộc họp, khung định hướng |
| AIVA Communications | Staff truyền thông hoặc mọi Staff có nhu cầu | Xây dựng tài liệu truyền thông phòng, chống HIV/AIDS cho từng đối tượng và bối cảnh | Thông điệp chính, FAQ, dàn ý truyền thông, nội dung tờ rơi/bài đăng/slide/kịch bản nói chuyện |
| AIVA IT Support | Toàn bộ Staff | Hỗ trợ sử dụng phần mềm đang vận hành, quy trình số, lỗi thường gặp và thao tác theo vai trò | Hướng dẫn từng bước, FAQ lỗi, checklist thao tác, giải thích quy trình nhập liệu/báo cáo |
| AIVA Trainer Space | Trainer | Nạp tài liệu, dạy AI, kiểm thử phản hồi, trả lời câu hỏi ngược từ AI và quản lý phiên bản tri thức | Kho tri thức, tình huống mẫu, câu trả lời chuẩn, hàng chờ câu hỏi từ AI |
| AIVA Admin Console | Admin | Quản trị tài khoản, đầu mối, địa bàn, theo dõi ca chuyển tuyến, giám sát hệ thống | Dashboard, nhật ký, phân quyền |

## 6. Không gian AIVA Care cho người có nguy cơ cao

AIVA Care là không gian tư vấn không yêu cầu đăng nhập. Bot phải nói chuyện theo phong cách kín đáo, không phán xét, nhẹ nhàng như một người bạn và chỉ hỏi những gì thật sự cần để hỗ trợ người dùng.

Mục tiêu của hội thoại không chỉ là trả lời câu hỏi, mà còn phải giảm hoang mang, hỗ trợ tâm lý ban đầu, khai thác thông tin theo cách tạo động lực và dẫn người dùng đến hành động đúng: xét nghiệm, PEP, PrEP, điều trị hoặc kết nối với người hỗ trợ thật.

### 6.1. Chức năng cốt lõi của AIVA Care

- Đánh giá sơ bộ nguy cơ
- Hướng dẫn sau phơi nhiễm
- Tư vấn xét nghiệm HIV
- Tư vấn PEP
- Tư vấn PrEP
- Tư vấn cơ bản về điều trị HIV
- Giải đáp các hiểu lầm phổ biến về HIV và STIs
- Hỗ trợ tâm lý ban đầu, giảm hoang mang
- Điều hướng tới cơ sở dịch vụ, phòng khám, hotline hoặc đầu mối hỗ trợ phù hợp
- Xin đồng ý chia sẻ thông tin và chuyển sang hỗ trợ con người khi cần

### 6.2. Giới hạn bắt buộc

- Không đọc kết quả xét nghiệm phức tạp như bác sĩ điều trị
- Không đưa phác đồ cá thể hóa
- Không thay thế tư vấn lâm sàng
- Không chẩn đoán chỉ dựa vào triệu chứng
- Không xử lý ca cấp cứu ngoài phạm vi chuyển tuyến hoặc khuyến nghị hỗ trợ khẩn

### 6.3. Luồng hội thoại chuẩn

1. Tạo niềm tin: chào đón, khẳng định tính riêng tư, nhắc rằng người dùng chỉ chia sẻ những gì họ thấy thoải mái.
2. Khai thác tối thiểu: hỏi về thời điểm, hành vi nguy cơ, nhu cầu hiện tại và mức độ lo lắng.
3. Tư vấn và hỗ trợ tâm lý: phản hồi cảm xúc trước, sau đó mới đi vào hướng dẫn cụ thể.
4. Điều hướng dịch vụ: hỏi nhu cầu được kết nối, xin đồng ý chia sẻ, cho chọn địa chỉ hoặc nhóm hỗ trợ.
5. Chuyển ca và theo dõi: gửi sang đầu mối phù hợp gần nhất nếu người dùng đồng ý.

## 7. Không gian AIVA Staff cho cán bộ/nhân viên HIV/AIDS

AIVA Staff không nên là một màn chat chung cho tất cả. Về nghiệp vụ, mỗi nhóm Staff cần có nhiệm vụ, giọng điệu, đầu ra và phạm vi tri thức riêng.

### 7.1. Chức năng cốt lõi dùng chung cho Staff

- Tra cứu nhanh hướng dẫn, quy định, quy trình
- Tóm tắt tài liệu nghiệp vụ
- Soạn thảo văn bản công việc
- Hỗ trợ xây dựng báo cáo
- Giải thích chỉ số HIV/AIDS
- Hỗ trợ giám sát dịch tễ học HIV
- Hỗ trợ chuẩn bị họp, agenda, biên bản, thông báo
- Hỗ trợ truyền thông và đào tạo
- Checklist công việc theo vai trò
- Hỗ trợ tổng hợp câu hỏi thường gặp từ tuyến dưới
- **Xây dựng tài liệu truyền thông về phòng, chống HIV/AIDS**
- **Hỗ trợ công nghệ thông tin và các phần mềm đang vận hành**

### 7.2. Giới hạn bắt buộc với Staff

- Không tự ban hành kết luận pháp lý hoặc kết luận chuyên môn chính thức
- Không bịa số liệu còn thiếu
- Không suy diễn khi tài liệu nguồn mâu thuẫn hoặc chưa đủ
- Không nhận dữ liệu cá nhân bệnh nhân đầy đủ nếu không thật sự cần
- Không thay thế quyết định lâm sàng cuối cùng của bác sĩ hoặc phụ trách chương trình

### 7.3. Bảng mô tả nhiệm vụ từng nhánh Staff

| Nhánh Staff | AI hỗ trợ chính | Đầu ra điển hình |
|---|---|---|
| CBO | Kịch bản tiếp cận cộng đồng, hỗ trợ tư vấn người có nguy cơ cao, tiếp nhận ca được điều hướng | Mẫu tư vấn, tóm tắt ca, việc cần làm tiếp theo |
| VCT/HTC | Tư vấn xét nghiệm, sàng lọc nguy cơ, FAQ trước/sau xét nghiệm | Nội dung tư vấn, câu hỏi sàng lọc, tài liệu ngắn cho đối tượng |
| OPC | Tra cứu và tóm tắt nội dung điều trị ARV, hỗ trợ tư vấn cơ bản | Giải thích khái niệm, nội dung truyền thông điều trị, câu trả lời chuẩn |
| XNKĐ | Hỗ trợ quy trình và FAQ liên quan xét nghiệm khẳng định HIV | Tóm tắt quy trình, câu hỏi thường gặp, nội dung hỗ trợ nội bộ |
| Giám sát dịch | Giải thích chỉ số, đọc bảng biểu, nhận định sơ bộ tình hình dịch | Nhận định, khung báo cáo, câu hỏi giám sát |
| Quản lý | Tóm tắt điều hành, nội dung họp, khung chiến lược và chính sách | Bản tóm tắt lãnh đạo, gợi ý định hướng, danh sách ưu tiên |
| Truyền thông | Xây dựng tài liệu truyền thông về phòng, chống HIV/AIDS theo từng nhóm đối tượng và mục tiêu | Thông điệp, FAQ, dàn ý truyền thông, nội dung tờ rơi/bài đăng/slide/kịch bản nói chuyện |
| Hỗ trợ CNTT / phần mềm | Hướng dẫn sử dụng phần mềm, quy trình số, xử lý lỗi thường gặp, chuẩn hóa nhập liệu và báo cáo | Hướng dẫn từng bước, checklist thao tác, FAQ lỗi, giải thích quy trình số |

## 8. Bổ sung riêng: nhiệm vụ Staff về xây dựng tài liệu truyền thông phòng, chống HIV/AIDS

Đây là nhiệm vụ nên được bổ sung chính thức vào cấu trúc AIVA. Về nghiệp vụ, phần này có thể triển khai theo hai cách:

1. xem là một chức năng dùng chung cho toàn bộ Staff
2. xây dựng thành một nhánh riêng là **Staff Truyền thông / AIVA Communications**

Khuyến nghị tốt hơn là phương án thứ hai, vì truyền thông đòi hỏi giọng điệu, đối tượng và sản phẩm đầu ra rất đặc thù.

### 8.1. Mục tiêu của AIVA Communications

- Chuyển kiến thức chuyên môn HIV/AIDS thành tài liệu truyền thông dễ hiểu, phù hợp đối tượng
- Hỗ trợ xây dựng thông điệp phòng, chống HIV/AIDS nhất quán, chính xác và không kỳ thị
- Giúp cán bộ tạo nhanh các sản phẩm truyền thông dùng được ngay trong công việc
- Giúp Trainer kiểm soát nội dung truyền thông thống nhất giữa các địa bàn và đơn vị

### 8.2. Đầu ra truyền thông mà AI cần hỗ trợ

- Thông điệp chính theo chủ đề: dự phòng, xét nghiệm, PEP, PrEP, điều trị, giảm kỳ thị
- FAQ cho cộng đồng hoặc cho từng nhóm đối tượng đích
- Dàn ý buổi truyền thông cộng đồng hoặc nói chuyện nhóm nhỏ
- Nội dung tờ rơi, poster, bài đăng mạng xã hội, tin nhắn ngắn, kịch bản video ngắn
- Slide hoặc khung bài trình bày tập huấn/truyền thông
- Bộ câu hỏi – trả lời chuẩn cho cán bộ tuyến dưới hoặc cộng tác viên

### 8.3. Các biến số nghiệp vụ mà AI cần hỏi trước khi tạo tài liệu truyền thông

- Đối tượng đích là ai
- Mục tiêu truyền thông là gì
- Kênh sử dụng là gì
- Mức độ chuyên môn mong muốn
- Giọng điệu cần dùng là gì

### 8.4. Nguyên tắc nội dung truyền thông bắt buộc

- Không kỳ thị, không đổ lỗi, không gieo sợ hãi cực đoan
- Không đưa thông tin sai hoặc lỗi thời về HIV/AIDS và STIs
- Ngôn ngữ phải phù hợp với nhóm đối tượng đích
- Thông điệp phải hướng được người nghe tới hành động cụ thể khi cần
- Khi có số liệu hoặc thông điệp chính thức, phải ưu tiên tài liệu do Trainer phê duyệt

## 9. Bổ sung riêng: AIVA IT Support / AIVA Digital Support

Đây là lớp năng lực dùng chung cho toàn bộ Staff, không chỉ cho một nhánh nghiệp vụ cụ thể. Mục tiêu là giúp cán bộ được hỗ trợ về công nghệ thông tin, các phần mềm đang vận hành và quy trình số trong công việc hàng ngày.

### 9.1. Phạm vi hỗ trợ

- Hướng dẫn sử dụng các phần mềm đang vận hành
- Giải thích quy trình thao tác trên phần mềm
- Hướng dẫn nhập liệu, tra cứu, xuất báo cáo
- Giải đáp lỗi thường gặp
- Hỗ trợ thao tác theo đúng vai trò người dùng
- Tóm tắt tài liệu hướng dẫn dùng phần mềm
- Tạo checklist thao tác cho người mới
- Hỗ trợ đào tạo nội bộ về công cụ số

### 9.2. Giá trị nghiệp vụ

- Giảm phụ thuộc vào hỏi người thật cho các lỗi lặp đi lặp lại
- Chuẩn hóa thao tác trên hệ thống
- Hạn chế sai sót khi nhập liệu và báo cáo
- Tăng hiệu quả chuyển đổi số trong hệ HIV/AIDS
- Giúp mọi Staff tiếp cận nhanh tri thức số do Trainer cung cấp

### 9.3. Ranh giới hỗ trợ

**Trong phạm vi**
- hướng dẫn dùng phần mềm
- giải thích quy trình số
- FAQ lỗi phổ biến
- checklist thao tác
- tài liệu đào tạo

**Ngoài phạm vi hoặc cần giới hạn**
- không tự sửa hệ thống
- không can thiệp hạ tầng
- không reset quyền trái phép
- không thay kỹ thuật viên xử lý sự cố máy chủ
- không bịa cách xử lý nếu không có tài liệu
- không hướng dẫn thao tác rủi ro ngoài tài liệu được Trainer phê duyệt

### 9.4. Luồng hội thoại chuẩn

1. Xác định phần mềm nào hoặc hệ thống nào đang được hỏi.
2. Xác định người dùng thuộc vai trò Staff nào và đang làm tác vụ gì.
3. AI trả lời theo dạng hướng dẫn từng bước, giải thích lỗi hoặc tóm tắt quy trình.
4. Nếu thiếu thông tin, AI hỏi ngắn gọn để làm rõ.
5. Nếu vượt ngoài tài liệu sẵn có, AI báo chưa đủ căn cứ và chuyển sang cơ chế hỏi Trainer hoặc hướng dẫn liên hệ đầu mối CNTT phù hợp.

## 10. Vai trò của Trainer và Admin trong cấu trúc AIVA

### 10.1. Trainer Space

- Nạp tài liệu và gắn nhãn theo nhóm sử dụng
- Định nghĩa giọng điệu phản hồi cho từng không gian AI
- Tạo tình huống mẫu và phản hồi chuẩn
- Kiểm định chất lượng phản hồi trước khi áp dụng rộng
- Quản lý phiên bản tri thức và vô hiệu hóa tài liệu cũ
- Nạp thêm tài liệu về phần mềm, quy trình số, SOP, FAQ lỗi thường gặp và tài liệu đào tạo nội bộ
- Theo dõi các câu hỏi mà AI chưa tự tin trả lời hoặc phát hiện có mâu thuẫn tri thức
- Trả lời, bổ sung hoặc hiệu chỉnh tri thức để AI tránh hỗ trợ sai cho User và Staff

### 10.2. Cơ chế AI hỏi ngược Trainer

AIVA nên có một cơ chế chính thức trong Trainer Workspace để AI **chủ động hỏi ngược Trainer** khi gặp các tình huống sau:

- thiếu tài liệu để trả lời chắc chắn
- có hai nguồn tri thức mâu thuẫn nhau
- gặp tính huống mới chưa có trong bộ tri thức
- tài liệu đã cũ hoặc chưa rõ hiệu lực
- câu hỏi liên quan phần mềm/quy trình số nhưng chưa có SOP hoặc hướng dẫn chuẩn
- nội dung có rủi ro cao nếu trả lời sai

#### Mục tiêu của cơ chế này

- giảm nguy cơ AI hỗ trợ sai
- tạo vòng phản hồi liên tục giữa AI và Trainer
- giúp tri thức được cập nhật theo thực tế vận hành
- biến Trainer Workspace thành nơi “huấn luyện chủ động”, không chỉ là nơi upload tài liệu

#### Đầu ra nên có trong Trainer Workspace

- danh sách câu hỏi AI đang chờ Trainer trả lời
- mức độ ưu tiên của từng câu hỏi
- đề xuất tài liệu hoặc chuyên đề còn thiếu
- lịch sử Trainer đã trả lời/chỉnh sửa
- trạng thái áp dụng vào bộ tri thức

### 10.3. Admin Console

- Tạo/sửa/khóa tài khoản
- Gán vai trò, địa bàn, nhóm chức năng
- Quản lý danh mục cơ sở hỗ trợ và đầu mối tiếp nhận
- Theo dõi ca điều hướng và trạng thái xử lý
- Giám sát sử dụng hệ thống và an toàn dữ liệu

## 11. Luồng nghiệp vụ điều hướng dịch vụ

1. **Phân loại nhu cầu**: CBO, VCT/HTC, OPC, XNKĐ hoặc nhóm hỗ trợ khác
2. **Xác định địa bàn**: người dùng chọn địa chỉ hoặc hệ thống gợi ý nơi gần nhất/phù hợp nhất
3. **Xin đồng ý chia sẻ**: phải nêu rõ chia sẻ gì, gửi cho ai và mục đích là gì
4. **Chuyển ca**: gửi thông tin tới đầu mối phù hợp trong phạm vi quyền và địa bàn
5. **Theo dõi trạng thái**: mới tạo, đã gửi, đã tiếp nhận, đang liên hệ, đã hỗ trợ, đóng ca

## 12. Quy tắc dữ liệu và bảo mật

- User có thể sử dụng AIVA Care mà không cần đăng nhập
- Thông tin nhận diện cá nhân chỉ thu thập khi thật sự cần cho bước hỗ trợ tiếp theo
- Không chia sẻ thông tin cho CBO/VCT/OPC/XNKĐ nếu chưa có sự đồng ý rõ ràng
- Nếu người dùng không đồng ý chia sẻ, AIVA vẫn tiếp tục tư vấn trong phạm vi có thể
- Dữ liệu của User và dữ liệu nghiệp vụ nội bộ của Staff phải tách riêng
- Mỗi Staff chỉ thấy dữ liệu phù hợp với vai trò và địa bàn được cấp
- Trainer được quản trị tri thức nhưng không mặc nhiên được xem mọi ca người dùng
- Các câu hỏi AI gửi sang Trainer phải được kiểm soát để không lộ dữ liệu nhạy cảm không cần thiết

## 13. Đề xuất triển khai theo giai đoạn

| Giai đoạn | Ưu tiên triển khai | Kết quả mong đợi |
|---|---|---|
| 1 | AIVA Care; điều hướng dịch vụ; Admin cơ bản; Trainer cơ bản; Staff cho CBO, VCT/HTC, Giám sát dịch; AIVA IT Support cơ bản | Có nền tảng dùng thử được cho tư vấn, hỗ trợ công việc cốt lõi và hỗ trợ phần mềm |
| 2 | OPC; XNKĐ; AIVA Communications; Trainer Workspace nâng cao với cơ chế AI hỏi ngược Trainer | Bổ sung chiều sâu chuyên môn, truyền thông và vòng phản hồi tri thức |
| 3 | AIVA Management; phối hợp nhiều đơn vị; mở rộng đánh giá chất lượng và cá nhân hóa theo vai trò | AIVA vận hành như nền tảng AI nhiều tầng hoàn chỉnh |

## 14. Kết luận chốt

AIVA phù hợp nhất khi được thiết kế như một **nền tảng AI đa vai trò**, gồm nhiều trợ lý chuyên trách, được quản trị tập trung, được huấn luyện bởi Trainer và có khả năng kết nối người có nguy cơ cao tới dịch vụ thật khi có đồng ý chia sẻ.

Trong cấu trúc cập nhật này, ngoài các không gian chuyên môn HIV/AIDS, AIVA còn cần:

- **AIVA Communications** để hỗ trợ xây dựng tài liệu truyền thông phòng, chống HIV/AIDS
- **AIVA IT Support** để hỗ trợ toàn bộ Staff về phần mềm, quy trình số và vận hành công nghệ thông tin
- **Trainer Workspace có cơ chế AI hỏi ngược Trainer** để liên tục lấp khoảng trống tri thức và giảm nguy cơ hỗ trợ sai
