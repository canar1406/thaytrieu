# Toán Thầy Triều - Nền Tảng Học Trực Tuyến 🎓

Một nền tảng học Toán trực tuyến toàn diện, hiện đại được thiết kế theo phong cách giao diện macOS (Liquid Glass / Glassmorphism) mang lại trải nghiệm học tập mượt mà và tập trung.

## ✨ Tính Năng Nổi Bật

### 1. Landing Page & Xác thực
- **Thiết kế chuẩn Apple/macOS**: Sử dụng hiệu ứng backdrop-filter, shadow đa tầng và typography tinh tế.
- **Micro-animations**: Hiệu ứng cuộn mượt mà, sticky header, hover effects tạo cảm giác cao cấp.
- **Đăng nhập nhanh**: Quy trình xác thực bằng số điện thoại. 

### 2. Dashboard Thông Minh (Dành cho Học Sinh)
- **Theo dõi tiến độ**: Biểu đồ Doughnut (Chart.js) thống kê bài học đã hoàn thành.
- **Countdown Timer**: Đồng hồ đếm ngược đến kỳ thi THPT Quốc Gia giúp học sinh quản lý thời gian.
- **Lịch học tuần (Weekly Calendar)**: Hiển thị sự kiện, livestream và bài tập theo thời gian thực.

### 3. Hệ Thống Khóa Học (Course Player)
- **Kiến trúc Data-Driven**: Nội dung khóa học (video, tài liệu, bài tập) được render linh hoạt từ file JSON.
- **Video & Tài liệu thông minh**: Tự động nhận diện link Google Drive (chuyển sang chế độ preview) và Youtube (chuyển sang embed) mà không cần can thiệp thủ công.
- Học sinh có thể đánh dấu hoàn thành bài học, theo dõi tiến trình trực quan.

### 4. Luyện Đề Thi Tương Tác (Exam Practice)
- **Tích hợp Markdown & LaTeX**: Hỗ trợ viết đề thi bằng Markdown, render công thức toán học sắc nét thông qua KaTeX.
- **Đa dạng câu hỏi theo chuẩn Bộ GD&ĐT**:
  - Trắc nghiệm 4 lựa chọn (Phần I).
  - Trắc nghiệm Đúng/Sai với điểm thành phần (Phần II).
  - Trắc nghiệm Điền đáp án ngắn (Phần III).
- **Trải nghiệm thi thực tế**: Đồng hồ đếm ngược (Countdown Timer), bảng câu hỏi (Question Palette), tự động chấm điểm và xem lời giải chi tiết.

---

## 🛠 Bộ Công Cụ Quản Trị (Admin Tool)
Hệ thống đi kèm với một công cụ quản trị (Local Admin) giúp giáo viên dễ dàng quản lý toàn bộ nội dung mà không cần biết lập trình.

### 🔑 Chức Năng Admin:
1. **Quản lý Học Sinh**: Thêm, sửa, xóa danh sách học sinh và cấp quyền đăng nhập (số điện thoại / mật khẩu).
2. **Quản lý Khóa Học**: Tạo khóa học mới, thêm chương học, bài học (Video/PDF) nhanh chóng qua giao diện kéo thả trực quan.
3. **Quản lý Đề Thi**: Thêm đề thi luyện tập trực tiếp vào hệ thống (hỗ trợ nhập link file Markdown hoặc JSON).
4. **Đồng Bộ Web (1-Click Publish)**: Chỉ với một nút bấm, toàn bộ dữ liệu mới sẽ được đóng gói và đẩy lên máy chủ GitHub để cập nhật trang web chính thức ngay lập tức!

---

## 🚀 Hướng Dẫn Cài Đặt Dành Cho Lập Trình Viên

1. **Clone repository**:
   ```bash
   git clone https://github.com/canar1406/thaytrieu.git
   cd thaytrieu
   ```

2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

3. **Chạy Admin Backend Server (Để sử dụng Admin Tool)**:
   ```bash
   node admin-server.js
   ```
   *Lưu ý: Môi trường Windows có thể bấm đúp vào file `start-admin.bat` để chạy nhanh máy chủ dữ liệu.*

4. **Chạy Development Server (Website chính)**:
   ```bash
   npm run dev
   ```

## 📚 Công Nghệ Sử Dụng
- **Core**: React 18, Vite, Node.js (Admin Server).
- **Styling**: Vanilla CSS (tối ưu hóa biến CSS cho theme màu, glassmorphism).
- **Libraries**:
  - `react-router-dom`: Quản lý điều hướng.
  - `react-markdown`, `remark-math`, `rehype-katex`: Xử lý đề thi toán học.
  - `chart.js`, `react-chartjs-2`: Trực quan hóa dữ liệu Dashboard.

---
*Dự án được xây dựng với mục tiêu mang lại trải nghiệm giáo dục tốt nhất cho học sinh chuẩn bị cho kỳ thi THPT Quốc Gia.*
