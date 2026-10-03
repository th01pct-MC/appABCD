# Hệ Thống Kiểm Tra Trắc Nghiệm Thông Minh Dành Cho Giáo Viên & Học Sinh

Ứng dụng web kiểm tra trắc nghiệm và Đúng/Sai chuyên nghiệp, giao diện tiếng Việt hiện đại, thân thiện, tương thích hoàn hảo trên điện thoại, máy tính bảng và máy tính.

- **Giáo viên phụ trách**: **HÀ THỊ MINH CHÂU**
- **Email quản trị viên**: **th01pct@gmail.com**
- **Email nhận kết quả**: **th01pct@gmail.com**

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. Nhận diện đáp án thông minh từ file nguồn (DOCX / XLSX / CSV / TXT)
- **Đọc định dạng Run-level XML của file DOCX**:
  - Tự động nhận diện phương án có **chữ màu đỏ** (hỗ trợ `#FF0000`, `#C00000`, `#DC2626`, crimson, darkred...).
  - Tự động nhận diện phương án có **gạch chân** (`underline`).
  - Hỗ trợ câu ghi rõ `Đáp án: A` hoặc `Đáp án: a-Đ, b-S, c-Đ, d-S`.
- **Xử lý mâu thuẫn & Trạng thái Cần kiểm tra**:
  - Nếu có mâu thuẫn (ví dụ văn bản ghi "Đáp án: B" nhưng phương án C lại được tô đỏ) hoặc không tìm thấy dấu hiệu rõ ràng, hệ thống tự động gắn nhãn **CẦN KIỂM TRA** (`needs_review`) và yêu cầu giáo viên xác nhận bằng 1 click trước khi lưu vào ngân hàng.
- **Có sẵn nút tải file mẫu**:
  - "Tải File Mẫu DOCX" (chứa sẵn câu hỏi có chữ đỏ và gạch chân).
  - "Tải File Mẫu Excel".

### 2. Màn hình phân tích sau khi upload (KẾT QUẢ PHÂN TÍCH FILE)
- Tổng hợp số liệu:
  - Tổng số câu
  - Trắc nghiệm nhiều lựa chọn
  - Đúng / Sai
  - Đáp án xác định thành công
  - Cần kiểm tra
- Cho phép giáo viên xem từng câu, nguồn nhận diện (Chữ màu đỏ, Gạch chân, Đáp án ghi rõ) và sửa nhanh đáp án trước khi lưu vào ngân hàng câu hỏi.

### 3. Bảo mật tuyệt đối & Chấm điểm tức thời (Server-Side Scoring & Autosave)
- **Bảo mật đáp án**: Đáp án đúng (`correctAnswer`, `statementAnswers`) **tuyệt đối không bao giờ được gửi xuống frontend của học sinh** trong suốt quá trình làm bài. Học sinh không thể soi qua DevTools.
- **Chấm ngay khi chọn**: Mỗi khi học sinh chọn một phương án hoặc một mệnh đề Đúng/Sai, dữ liệu được gửi ngay lên server, chấm điểm và lưu vào cơ sở dữ liệu.
- **Cho phép thay đổi đáp án**: Nếu học sinh đổi ý trước khi nộp, server tự động chấm lại và lưu lịch sử thay đổi.
- **Khôi phục phiên làm bài**: Tự động lưu cache cục bộ kết hợp máy chủ nếu học sinh lỡ tải lại trang.

### 4. Ra đề & Chống gian lận
- Tạo đề thi với số câu trắc nghiệm và số câu Đúng/Sai mong muốn.
- Random câu hỏi từ ngân hàng không trùng lặp.
- Đảo thứ tự câu hỏi và đảo các phương án A/B/C/D.
- Mỗi học sinh nhận một đề thi ngẫu nhiên riêng biệt.
- Đồng hồ đếm ngược thời gian thực, tự động nộp bài khi hết giờ.
- Cảnh báo và ghi nhận số lần học sinh chuyển tab/rời màn hình thi.

### 5. Kết quả & Gửi email tự động
- Thang điểm 10.0 chuẩn quốc gia, làm tròn 2 chữ số thập phân.
- Bảng dashboard kết quả học sinh: tìm kiếm theo tên, lọc theo lớp, lọc theo đề, xem chi tiết bài làm, xem lịch sử đổi đáp án, xuất báo cáo CSV/Excel.
- Tự động kích hoạt gửi email thông báo kết quả tới **th01pct@gmail.com** ngay khi học sinh nộp bài.

### 6. Tùy chỉnh Logo thương hiệu
- Giáo viên có thể tải lên Logo trường / Logo cá nhân (PNG, JPG, WEBP) trực tiếp từ giao diện Quản trị.
- Logo lập tức hiển thị tại trang đăng ký của học sinh, thanh tiêu đề phòng thi và trang báo cáo kết quả.

---

## 🚀 HƯỚNG DẪN TRIỂN KHAI & CHẠY ỨNG DỤNG

### 1. Chạy trong môi trường AI Studio
Dự án đã được cấu hình trọn gói với Express Server và Vite middleware:
```bash
npm run dev
```
Hệ thống sẽ chạy trên cổng `3000`.

### 2. Cấu hình biến môi trường (`.env`)
Sao chép `.env.example` sang `.env`:
- `TEACHER_NAME`: Tên giáo viên quản trị (mặc định: `HÀ THỊ MINH CHÂU`).
- `TEACHER_EMAIL`: Email quản trị & nhận kết quả (mặc định: `th01pct@gmail.com`).
- `RESEND_API_KEY`: (Tùy chọn) Điền API key từ Resend nếu muốn gửi email thực tế đến hộp thư Gmail.

### 3. Triển khai Firebase (Tùy chọn)
Nếu muốn sử dụng Firebase Firestore thay cho database lưu trữ cục bộ:
1. Tạo dự án trên [Firebase Console](https://console.firebase.google.com).
2. Điền các biến `VITE_FIREBASE_*` vào `.env`.
3. Triển khai file `firestore.rules` có sẵn trong thư mục gốc.

---

## 🔒 TÀI KHOẢN QUẢN TRỊ
- **Email quản trị viên**: `th01pct@gmail.com`
- Bất kỳ tài khoản/email nào khác khi cố gắng đăng nhập vào trang quản trị sẽ nhận được thông báo:
  > *"Bạn không có quyền truy cập trang quản trị."*
