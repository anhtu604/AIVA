# AIVA — Checklist kế hoạch build (Next.js serverless + Supabase)

Tài liệu này dùng để theo dõi tiến độ build bản chạy thử của AIVA theo từng giai đoạn, nhiệm vụ và mốc nghiệm thu.

## Bảng tổng quan tiến độ

| Giai đoạn | Tên giai đoạn | Mục tiêu chính | Kết quả cần đạt | Trạng thái |
|---|---|---|---|---|
| GĐ0 | Chốt phạm vi pilot | Khóa scope bản chạy thử | Scope, module MVP, vai trò pilot | [ ] |
| GĐ1 | Kiến trúc tổng thể | Chốt cấu trúc FE/BE/AI/Data | Sơ đồ module, luồng hệ thống | [ ] |
| GĐ2 | Database Supabase | Thiết kế dữ liệu và phân quyền | ERD, bảng, RLS, seed data | [ ] |
| GĐ3 | Auth & RBAC | Đăng nhập, vai trò, địa bàn | Quyền truy cập đúng vai trò | [ ] |
| GĐ4 | Lõi AI & adapter | Tách lớp AI khỏi app | Adapter model, orchestration | [ ] |
| GĐ5 | Trainer Workspace | Nạp tri thức và dạy AI | Upload tài liệu, test tri thức | [ ] |
| GĐ6 | AIVA Care (Public) | Bot cho người có nguy cơ cao | Chat public, consent, referral | [ ] |
| GĐ7 | Staff Workspace | Bot cho Staff theo module | CBO, VCT, Surveillance, Comms, IT Support | [ ] |
| GĐ8 | Referral & linkage | Điều hướng ca sang đơn vị thật | Queue tiếp nhận, trạng thái ca | [ ] |
| GĐ9 | Admin Console | Quản trị tài khoản, đơn vị, địa bàn | Dashboard admin, phân quyền | [ ] |
| GĐ10 | QA, Safety, Pilot | Kiểm thử và chạy thử | Checklist pilot, log, hardening | [ ] |

## GĐ0 — Chốt phạm vi pilot

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Chốt mục tiêu bản pilot | Product/BA | Chạy thử thật, không phải bản cuối |  |
| [ ] | Chốt các nhóm người dùng bật ở pilot | Product/BA | User, Staff, Trainer, Admin |  |
| [ ] | Chốt các module Staff bật trước | Product/BA | CBO, VCT/HTC, Surveillance, Communications, IT Support |  |
| [ ] | Chốt các luồng bắt buộc cho AIVA Care | Product/BA | nguy cơ, PEP, PrEP, xét nghiệm, consent |  |
| [ ] | Chốt phạm vi Trainer Workspace | Product/BA | upload tài liệu, test phản hồi, AI hỏi ngược Trainer |  |
| [ ] | Chốt phạm vi Admin pilot | Product/BA | tạo user, gán quyền, địa bàn, đơn vị |  |
| [ ] | Chốt tiêu chí hoàn thành pilot | Product/BA | phải có demo end-to-end |  |

### Mốc nghiệm thu
- [ ] Có tài liệu scope 1 bản
- [ ] Có danh sách module MVP
- [ ] Có tiêu chí “done” cho pilot

## GĐ1 — Kiến trúc tổng thể

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Chốt kiến trúc 4 khu chính | BA/Architect | Public, Staff, Trainer, Admin |  |
| [ ] | Chốt cấu trúc route/frontend | FE | route tree rõ ràng theo workspace |  |
| [ ] | Chốt domain backend | BE | auth, conversations, knowledge, referrals, admin |  |
| [ ] | Chốt kiến trúc lớp AI | AI/BE | orchestration, retrieval, safety, adapter |  |
| [ ] | Chốt cơ chế tách model khỏi app | AI/BE | chuẩn bị cho self-host Gemma sau này |  |
| [ ] | Chốt luồng dữ liệu consent/referral | BA/BE | từ public sang Staff |  |
| [ ] | Chốt chuẩn log/audit | BE/Security | consent, access, referral, trainer feedback |  |

### Mốc nghiệm thu
- [ ] Có sơ đồ module
- [ ] Có sơ đồ luồng request
- [ ] Có danh sách service/domain chính

## GĐ2 — Database Supabase

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Thiết kế ERD tổng thể | Data/BE | bám theo AIVA cập nhật |  |
| [ ] | Tạo nhóm bảng identity & access | Data/BE | users, profiles, roles, permissions |  |
| [ ] | Tạo nhóm bảng địa bàn và đơn vị | Data/BE | province, org, unit, service location |  |
| [ ] | Tạo nhóm bảng conversations public | Data/BE | sessions, conversations, messages |  |
| [ ] | Tạo nhóm bảng staff workspace | Data/BE | tasks, outputs, staff conversations |  |
| [ ] | Tạo nhóm bảng trainer knowledge | Data/BE | docs, versions, tags, scenarios |  |
| [ ] | Tạo nhóm bảng referral | Data/BE | referral, target, status history |  |
| [ ] | Tạo nhóm bảng consent & audit | Data/BE | consent records, audit logs |  |
| [ ] | Tạo nhóm bảng vector retrieval | Data/BE | chunks, embeddings, retrieval logs |  |
| [ ] | Thiết kế metadata cho tài liệu CNTT/phần mềm | Data/BE | software name, version, role, module |  |
| [ ] | Viết migration đầu tiên | BE | để môi trường dev/staging đồng bộ |  |
| [ ] | Tạo seed data cơ bản | Data/BE | roles, permissions, service types, provinces |  |
| [ ] | Thiết kế RLS matrix | Data/Security | theo vai trò + địa bàn + loại dữ liệu |  |

### Mốc nghiệm thu
- [ ] Có ERD
- [ ] Có migration
- [ ] Có seed data
- [ ] Có ma trận RLS sơ bộ

## GĐ3 — Auth, phân quyền, địa bàn

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tích hợp login cho Staff/Trainer/Admin | FE/BE | public không cần login |  |
| [ ] | Tạo luồng tạo tài khoản nội bộ | BE/Admin | Admin tạo user |  |
| [ ] | Gán nhiều vai trò cho 1 user | BE | ví dụ vừa CBO vừa Communications |  |
| [ ] | Gán phạm vi địa bàn cho user | BE | tỉnh, đơn vị, khu vực |  |
| [ ] | Kiểm tra quyền theo workspace | FE/BE | ai vào được đâu |  |
| [ ] | Chặn truy cập trái phép | FE/BE | forbidden, unauthorized |  |
| [ ] | Ghi audit khi đổi quyền | BE | log rõ ai đổi quyền cho ai |  |
| [ ] | Tạo màn chọn vai trò hiện hành | FE | nếu 1 user có nhiều vai trò |  |

### Mốc nghiệm thu
- [ ] Admin tỉnh không thấy dữ liệu tỉnh khác
- [ ] Staff không vào Trainer/Admin nếu không có quyền
- [ ] Public không chạm dữ liệu nội bộ

## GĐ4 — Lõi AI và model adapter

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Định nghĩa contract gọi AI thống nhất | AI/BE | input/output chuẩn cho mọi module |  |
| [ ] | Dựng adapter model | AI/BE | mock mode, external mode, self-host mode |  |
| [ ] | Tách system behavior theo workspace | AI | public khác staff khác trainer |  |
| [ ] | Tạo lớp safety trước/sau model | AI/BE | moderation, sensitive handling |  |
| [ ] | Tạo lớp retrieval tích hợp tài liệu | AI/BE | lấy tri thức theo vai trò |  |
| [ ] | Tạo memory ngắn hạn cho chat | AI/BE | session state pilot |  |
| [ ] | Log metadata của prompt/response | AI/BE | không log quá mức dữ liệu nhạy cảm |  |
| [ ] | Tạo fallback khi model lỗi | AI/BE | degraded mode |  |
| [ ] | Test chuyển đổi endpoint model | AI/BE | đảm bảo không đổi business flow |  |

### Mốc nghiệm thu
- [ ] App gọi AI qua 1 lớp thống nhất
- [ ] Có thể đổi backend model mà không sửa UI/logic nghiệp vụ

## GĐ5 — Trainer Workspace

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Xây màn upload tài liệu | FE/BE | PDF, DOCX, MD nếu cần |  |
| [ ] | Gắn nhãn tài liệu theo nhóm sử dụng | FE/BE | public/staff/trainer-specific |  |
| [ ] | Gắn nhãn theo module Staff | FE/BE | CBO, VCT, Surveillance, Comms, IT Support |  |
| [ ] | Gắn phiên bản và hiệu lực tài liệu | FE/BE | current, archived, superseded |  |
| [ ] | Xử lý chunking/indexing | AI/BE | retrieval-ready |  |
| [ ] | Tạo màn test câu hỏi với tri thức đã nạp | FE/AI | test response thực tế |  |
| [ ] | Tạo cơ chế Trainer đánh giá phản hồi | FE/AI | đúng/chưa đủ/sai |  |
| [ ] | Tạo cơ chế AI hỏi ngược Trainer | AI/FE/BE | khi thiếu tri thức, mâu thuẫn hoặc rủi ro trả sai |  |
| [ ] | Tạo hàng đợi câu hỏi cần Trainer trả lời | FE/BE | unresolved knowledge queue |  |
| [ ] | Lưu câu trả lời Trainer thành tri thức mới | BE/AI | cập nhật knowledge base |  |
| [ ] | Test quy trình tài liệu CNTT/phần mềm | AI/Trainer | riêng cho IT Support |  |

### Mốc nghiệm thu
- [ ] Trainer upload tài liệu
- [ ] AI dùng được tài liệu đó
- [ ] Khi tri thức thiếu, AI tạo được câu hỏi ngược để Trainer bổ sung

## GĐ6 — AIVA Care (Public chatbot)

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Thiết kế landing public | FE | kín đáo, thân thiện |  |
| [ ] | Tạo entry points nhanh | FE | nguy cơ, xét nghiệm, PEP/PrEP, tâm sự |  |
| [ ] | Tạo session ẩn danh | BE | không bắt đăng nhập |  |
| [ ] | Tạo luồng đánh giá nguy cơ sơ bộ | AI/BE | từng bước, không ép cung |  |
| [ ] | Tạo luồng sau phơi nhiễm | AI/BE | định hướng hành động đúng |  |
| [ ] | Tạo luồng xét nghiệm | AI/BE | hướng dẫn đúng thời điểm |  |
| [ ] | Tạo luồng PEP/PrEP | AI/BE | điều hướng dịch vụ |  |
| [ ] | Tạo luồng hỗ trợ tâm lý ban đầu | AI/BE | đồng cảm, không phán xét |  |
| [ ] | Tạo cơ chế xin đồng ý chia sẻ | FE/BE | nêu rõ chia sẻ gì, cho ai, mục đích gì |  |
| [ ] | Tạo màn chọn địa bàn/nhóm hỗ trợ | FE | CBO, VCT, OPC, XNKĐ... |  |
| [ ] | Tạo referral record từ public | BE | đẩy sang queue nội bộ |  |
| [ ] | Tạo crisis flag / escalation | AI/BE | nếu có dấu hiệu nguy cơ cao |  |
| [ ] | Tạo màn xác nhận đã gửi yêu cầu | FE | rõ ràng, bảo mật |  |

### Mốc nghiệm thu
- [ ] Một user public đi hết hành trình chat → consent → referral thành công

## GĐ7A — Khung chung cho Staff

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo dashboard Staff | FE | theo vai trò hiện hành |  |
| [ ] | Tạo module switcher | FE | đổi giữa CBO/VCT/Surveillance/Comms/IT |  |
| [ ] | Tạo chat UI/task UI chung | FE | thống nhất trải nghiệm |  |
| [ ] | Tạo lưu lịch sử công việc | BE/FE | outputs, drafts, sessions |  |
| [ ] | Tạo thư viện mẫu dùng lại | BE/FE | template library |  |

## GĐ7B — AIVA CBO

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo prompt profile cho CBO | AI | giọng gần gũi, thực địa |  |
| [ ] | Bật tra cứu nội dung tư vấn cộng đồng | AI/BE | theo tri thức Trainer |  |
| [ ] | Bật tiếp nhận referral public | BE/FE | hàng đợi riêng |  |
| [ ] | Tạo gợi ý hướng can thiệp tiếp theo | AI | thực tế, ngắn gọn |  |

## GĐ7C — AIVA VCT/HTC

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo prompt profile cho VCT/HTC | AI | chuẩn tư vấn xét nghiệm |  |
| [ ] | Bật tra cứu quy trình và FAQ xét nghiệm | AI/BE | theo tài liệu Trainer |  |
| [ ] | Bật tiếp nhận ca phù hợp | BE/FE | từ public/referral |  |
| [ ] | Tạo output hỗ trợ tư vấn chuẩn | AI | dùng được ngay |  |

## GĐ7D — AIVA Surveillance

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo prompt profile giám sát dịch | AI | logic, ngắn gọn, có cảnh báo thiếu dữ liệu |  |
| [ ] | Bật giải thích chỉ số HIV | AI/BE | theo tài liệu Trainer |  |
| [ ] | Bật hỗ trợ nhận định sơ bộ | AI | không suy diễn quá mức |  |
| [ ] | Bật hỗ trợ báo cáo/bảng biểu | FE/AI | output có cấu trúc |  |

## GĐ7E — AIVA Communications

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo prompt profile truyền thông | AI | không kỳ thị, thân thiện |  |
| [ ] | Bật viết nội dung truyền thông HIV/AIDS | AI/BE | theo đối tượng mục tiêu |  |
| [ ] | Bật chuyển 1 nội dung thành nhiều format | AI | FAQ, dàn ý, bài ngắn, thông điệp |  |
| [ ] | Bật kiểm tra ngôn ngữ kỳ thị/rủi ro | AI/Safety | rất quan trọng |  |
| [ ] | Tạo template truyền thông dùng lại | FE/BE | tiết kiệm thời gian |  |

## GĐ7F — AIVA IT Support / Digital Support

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo prompt profile IT Support | AI | hướng dẫn rõ, theo SOP |  |
| [ ] | Nạp tài liệu phần mềm đang vận hành | Trainer/BE | user manual, SOP, FAQ, version notes |  |
| [ ] | Gắn tài liệu theo phần mềm/chức năng/vai trò | Trainer/BE | CBO khác Surveillance nếu cần |  |
| [ ] | Tạo luồng hỏi đáp lỗi thường gặp | AI/BE | login, nhập liệu, báo cáo, phân quyền |  |
| [ ] | Tạo luồng hướng dẫn thao tác từng bước | AI | step-by-step |  |
| [ ] | Tạo luồng AI hỏi ngược Trainer khi thiếu tri thức phần mềm | AI/Trainer | tránh hỗ trợ sai |  |
| [ ] | Tạo cảnh báo khi vượt phạm vi hỗ trợ | AI/Safety | chuyển sang đầu mối IT thật nếu cần |  |

### Mốc nghiệm thu
- [ ] Staff vào đúng module
- [ ] Module trả lời đúng phong cách và đúng tài liệu
- [ ] IT Support hoạt động cho toàn Staff

## GĐ8 — Referral & tiếp nhận ca

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Thiết kế logic match đơn vị tiếp nhận | BE | theo địa bàn + loại dịch vụ |  |
| [ ] | Tạo referral queue | BE/FE | cho Staff phù hợp |  |
| [ ] | Tạo màn xem chi tiết ca | FE | dữ liệu tối thiểu cần thiết |  |
| [ ] | Tạo cập nhật trạng thái ca | FE/BE | mới, đã nhận, đang xử lý, đóng ca |  |
| [ ] | Tạo lịch sử trạng thái | BE | audit trail |  |
| [ ] | Tạo cảnh báo ca chưa xử lý quá hạn | BE/Admin | nếu cần |  |
| [ ] | Tạo dashboard referral | FE/Admin | tổng quan theo địa bàn, loại ca |  |

### Mốc nghiệm thu
- [ ] Ca public vào đúng queue
- [ ] Staff nhận và đổi trạng thái được
- [ ] Admin theo dõi được

## GĐ9 — Admin Console

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Tạo màn user management | FE/BE | tạo, sửa, khóa tài khoản |  |
| [ ] | Tạo màn role management | FE/BE | gán nhiều vai trò |  |
| [ ] | Tạo màn quản lý địa bàn/đơn vị | FE/BE | tỉnh, cơ sở, điểm dịch vụ |  |
| [ ] | Tạo màn quản lý service directory | FE/BE | CBO, VCT, OPC, XNKĐ... |  |
| [ ] | Tạo dashboard sử dụng hệ thống | FE/BE | sessions, referrals, usage |  |
| [ ] | Tạo dashboard an toàn | FE/BE | flags, crisis, unresolved knowledge |  |
| [ ] | Tạo log tra cứu/audit | FE/BE | ai xem gì, đổi gì |  |

### Mốc nghiệm thu
- [ ] Admin tỉnh quản được phạm vi tỉnh
- [ ] Admin TW xem được tổng quan toàn hệ

## GĐ10 — QA, Safety, Pilot hardening

| Check | Nhiệm vụ | Nhóm | Ghi chú | Done |
|---|---|---|---|---|
| [ ] | Test role leakage | QA/Security | không rò quyền |  |
| [ ] | Test data leakage | QA/Security | không rò dữ liệu nhạy cảm |  |
| [ ] | Test consent logging | QA/BE | phải có bằng chứng đồng ý |  |
| [ ] | Test referral correctness | QA/BE | đúng địa bàn, đúng nhóm nhận |  |
| [ ] | Test trainer upload → retrieval | QA/AI | tri thức cập nhật có hiệu lực |  |
| [ ] | Test AI hỏi ngược Trainer | QA/AI | khi tài liệu thiếu/mâu thuẫn |  |
| [ ] | Test public crisis flow | QA/AI | escalation/fallback đúng |  |
| [ ] | Test IT Support theo tài liệu phiên bản mới | QA/AI | tránh hướng dẫn sai |  |
| [ ] | Test model outage fallback | QA/BE | hệ thống không sập toàn bộ |  |
| [ ] | Test performance pilot | QA/BE/FE | chat, queue, dashboard |  |
| [ ] | Tạo checklist chạy pilot thật | PM/QA | trước khi mở dùng thử |  |

### Mốc nghiệm thu
- [ ] Có checklist pass/fail rõ ràng
- [ ] Có bản sửa lỗi cuối trước pilot

## Bảng theo dõi ưu tiên chung

| Mức ưu tiên | Hạng mục |
|---|---|
| P1 | Database, Auth/RBAC, Lõi AI adapter, Trainer upload, AIVA Care, Referral cơ bản, Staff core modules |
| P2 | Template library, Analytics, Feedback loop, IT Support nâng cao, Dashboard tốt hơn |
| P3 | Management nâng cao, OPC/XNKĐ sâu, workflow nhiều cấp, self-host toàn bộ |

## Bảng phân công theo nhóm

| Nhóm | Phạm vi chính |
|---|---|
| Product/BA | Scope, use case, acceptance criteria, luồng nghiệp vụ |
| Backend | Auth, RBAC, API, consent, referral, audit, trainer pipeline |
| Frontend | Public UI, Staff workspace, Trainer workspace, Admin console |
| AI/Knowledge | Adapter, prompts, retrieval, safety, evaluation, AI hỏi ngược Trainer |
| Data | Schema, ERD, seed, metadata, RLS matrix |
| QA/Security | Test quyền, dữ liệu, consent, referral, fallback, pilot checklist |

## Bảng “done” cấp dự án pilot

| Check | Tiêu chí hoàn thành pilot | Done |
|---|---|---|
| [ ] | User public có thể được tư vấn kín đáo và tạo referral thành công |  |
| [ ] | Staff dùng được ít nhất 5 module: CBO, VCT/HTC, Surveillance, Communications, IT Support |  |
| [ ] | Trainer upload tài liệu và AI dùng được tài liệu đó |  |
| [ ] | AI có thể hỏi ngược Trainer khi tri thức thiếu hoặc mâu thuẫn |  |
| [ ] | Admin quản lý được user, quyền, địa bàn, đơn vị tiếp nhận |  |
| [ ] | Consent và referral có log/audit |  |
| [ ] | Có fallback khi model lỗi |  |
| [ ] | Qua được checklist QA tối thiểu để chạy thử |  |