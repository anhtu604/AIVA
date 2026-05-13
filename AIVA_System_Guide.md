# TÀI LIỆU HƯỚNG DẪN SỬ DỤNG HỆ THỐNG AIVA

Tài liệu này cung cấp cái nhìn toàn cảnh về luồng vận hành, danh sách các Bot Telegram, vai trò của từng loại tài khoản và danh sách các lệnh chi tiết để sử dụng hệ thống AIVA.

---

## 1. LUỒNG VẬN HÀNH TỔNG QUAN (WORKFLOW)

Hệ thống AIVA hoạt động theo một quy trình phối hợp khép kín giữa các vai trò:

1. **Super Admin**: Nắm quyền cao nhất, khởi tạo mã kích hoạt cho Admin 34 tỉnh, Trainer và Staff. Phân quyền cho Trainer/Staff dựa trên 9 chuyên môn của AIVA.
2. **Admin Tỉnh**: Quản lý địa bàn tỉnh của mình, tạo mã kích hoạt cho các Tư Vấn Viên (TVV) thuộc tỉnh đó.
3. **Trainer**: Chuyên gia huấn luyện AI. Trainer upload tài liệu (PDF, Word...) để nạp kiến thức cho AI (Knowledge Base), đồng thời trực tiếp trả lời các câu hỏi khó mà AI chưa biết trả lời (Pending Questions).
4. **Staff / TVV**: Nhân viên hoặc Tư Vấn Viên. Sử dụng bot để hỗ trợ công việc. Staff/TVV được cấp quyền chuyên môn (ví dụ: `testing`, `care`, `cbo`...) để hệ thống định tuyến (Chatflow) lấy đúng nguồn kiến thức chuyên ngành hỗ trợ họ.
5. **AIVA Care (AI)**: Bot AI trả lời trực tiếp người dùng/TVV. Nếu gặp câu hỏi khó không có trong dữ liệu, AI tự động chuyển câu hỏi vào hàng đợi cho Trainer trả lời.

---

## 2. DANH SÁCH 9 QUYỀN CHUYÊN MÔN (CATEGORIES)

Mỗi Trainer và Staff/TVV sẽ được phân loại theo các nhóm chuyên môn sau để AI hiểu ngữ cảnh và giới hạn phạm vi tài liệu:

- `care`: AIVA Care (Chăm sóc, điều trị ARV)
- `cbo`: AIVA CBO (Tiếp cận cộng đồng)
- `testing`: AIVA Testing (Sàng lọc, xét nghiệm, TVV)
- `confirmation_testing`: AIVA Confirmation Testing (Xét nghiệm khẳng định)
- `opc`: AIVA OPC (Khám chữa bệnh ngoại trú)
- `me`: AIVA M&E (Theo dõi, đánh giá, báo cáo)
- `management`: AIVA Management (Quản lý dự án, tài chính)
- `communications`: AIVA Communications (Truyền thông)
- `it`: AIVA IT Support (Hỗ trợ kỹ thuật)

*(Lưu ý: TVV thường là Staff thuộc mảng Sàng lọc - `testing`, tuy nhiên tuỳ thuộc vào sự phân quyền của Admin).*

---

## 3. HƯỚNG DẪN CHI TIẾT TỪNG BOT & VAI TRÒ

### 👑 3.1. AIVA Admin Bot (@aiva_adminbot)
**Dành cho:** Super Admin và Admin 34 Tỉnh.
**Chức năng chính:** Quản lý mã kích hoạt, nhân sự, phân quyền.

*Sau khi có mã (ví dụ: `SA-123456` hoặc `ADM-XXXXXX`), bạn cần gửi tin nhắn cho bot:*
- **Kích hoạt tài khoản:** `/kichhoat <Mã>`

**Lệnh dành cho Super Admin:**
- `/themma TR <quyền 1, quyền 2...>`: Tạo mã kích hoạt cho Trainer với quyền chuyên môn.
  *Ví dụ: `/themma TR care, cbo`*
- `/themma STAFF <quyền 1, quyền 2...>`: Tạo mã kích hoạt cho Staff/TVV.
  *Ví dụ: `/themma STAFF testing, opc`*
- `/themquyen <mã> <quyền>`: Thêm quyền mới cho một Trainer/Staff đã tồn tại.
- `/xoaquyen <mã> <quyền>`: Thu hồi một quyền của Trainer/Staff.
- `/danhsach <loại>`: Xem danh sách mã/nhân sự (`loại` bao gồm: `ADM`, `TR`, `TVV`, `STAFF`).
- `/dstinhs`: Xem thống kê tình trạng kích hoạt của Admin 34 tỉnh.
- `/dsquyen`: Xem lại danh sách 9 mã quyền hợp lệ của AIVA.
- `/xoama <mã>`: Xóa vĩnh viễn một mã Trainer/Staff/TVV khỏi hệ thống.
- `/resetma <mã>`: Hủy trạng thái đã kích hoạt của mã (để có thể kích hoạt lại trên tài khoản Telegram khác).

**Lệnh dành cho Admin Tỉnh:**
- `/themtvv <Tên> | <SĐT> | <Khu vực 1, Khu vực 2>`: Tạo mã kích hoạt TVV cho địa bàn quản lý.
- `/dstvv`: Xem danh sách toàn bộ TVV trong tỉnh của mình.
- `/xoatvv <Mã>`: Xoá một TVV khỏi hệ thống của tỉnh.

---

### 📚 3.2. AIVA Trainer Bot (@aiva_trainer_bot)
**Dành cho:** Chuyên gia / Trainer.
**Chức năng chính:** Nạp tài liệu cho AI học và giải quyết các câu hỏi khó của AI.

*Sau khi nhận mã `TR-XXXXXX` từ Super Admin, bạn cần nhắn cho bot:*
- **Kích hoạt tài khoản:** `/kichhoat <Mã>`

**Tính năng & Lệnh thao tác:**
- **Upload Tài liệu (Dạy AI):** Chỉ cần kéo thả/gửi một file tài liệu (PDF, Word, PPTX...) trực tiếp vào bot. Bot sẽ tự động đọc, phân tích từ khóa và xếp vào đúng `quyền chuyên môn` của bạn, sau đó lưu vào Knowledge Base để AI bắt đầu học.
- `/cauhoi`: Xem danh sách các câu hỏi của người dùng mà AI không thể trả lời được.
- `/traloi <ID Câu hỏi>`: Chọn một câu hỏi cụ thể để trả lời. Câu trả lời của bạn sẽ được lưu thành Q&A để AI tự động trả lời cho những lần sau.
- `/huy`: Hủy bỏ trạng thái đang trả lời câu hỏi.
- **Tra cứu kiến thức:** Gõ một câu hỏi bất kỳ, bot sẽ tra cứu trong Kho Dữ Liệu (Knowledge Base) của riêng chuyên môn của bạn để hiển thị kết quả.
- `/thongtin`: Xem lại thông tin tài khoản và các quyền chuyên môn đang nắm giữ.

---

### 💼 3.3. AIVA Staff Bot (@aiva_staff_bot)
**Dành cho:** Nhân viên nội bộ (Staff) / Tư Vấn Viên.
**Chức năng chính:** Trợ lý ảo AI nội bộ dành riêng cho nghiệp vụ (Chatflow đa lớp).

*Sau khi nhận mã `STF-XXXXXX` từ Super Admin, bạn cần nhắn cho bot:*
- **Kích hoạt tài khoản:** `/kichhoat <Mã>`

**Tính năng & Lệnh thao tác:**
- **Chat nghiệp vụ (Chatflow):** Bạn chỉ cần nhắn tin bình thường với bot. Hệ thống Staff Bot sẽ tự động gửi danh sách `quyền chuyên môn` của bạn (ví dụ: `management`, `it`) vào Chatflow của Dify. Từ đó, Chatflow (đã tách lớp) sẽ định tuyến vào đúng thư viện tài liệu tương ứng để trả lời chính xác nhất.
- `/thongtin`: Xem quyền chuyên môn mình đang được phân công.
- `/help`: Xem hướng dẫn lệnh.

---

### 🤖 3.4. AIVA Care Bot (@aiva_telegram_bot)
**Dành cho:** Khách hàng, Người dùng cuối.
**Chức năng chính:** Chatbot tư vấn thông tin tổng hợp.

*Đây là bot công khai, không cần mã kích hoạt.*

**Tính năng & Lệnh thao tác:**
- `/start`: Bắt đầu trò chuyện.
- **Hỏi đáp AI:** Gửi bất kỳ câu hỏi nào. AI sẽ trả lời dựa trên lượng kiến thức đã được Trainer huấn luyện.
- **Hệ thống chuyển tuyến (Escalation):** Nếu người dùng hỏi một câu quá khó hoặc nằm ngoài dữ liệu, AI sẽ báo lỗi "Xin lỗi, mình chưa có câu trả lời". Lúc này, hệ thống sẽ **ngầm** bắt lại câu hỏi đó và gửi thẳng vào hàng đợi (`/cauhoi`) của Trainer Bot. Khi Trainer vào giải quyết, AI sẽ trở nên thông minh hơn.

---

## 4. TỔNG KẾT QUY TRÌNH KÍCH HOẠT MỘT NHÂN SỰ MỚI

Giả sử cần thêm một Staff làm mảng Công nghệ Thông tin (IT) và Truyền thông (Communications):
1. **Super Admin** vào Admin Bot gõ: `/themma STAFF it, communications`
2. Bot trả về mã: `STF-A1B2C3`
3. **Staff** mở ứng dụng Telegram, tìm đến Staff Bot.
4. **Staff** gõ lệnh: `/kichhoat STF-A1B2C3`
5. Kích hoạt thành công. Từ giờ Staff nhắn tin, hệ thống tự biết người này có quyền `it` và `communications` để AI trả lời cho đúng ngữ cảnh và nghiệp vụ.
