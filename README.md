# Toán Thầy Triều - Nền Tảng Học Trực Tuyến 🎓

Một nền tảng học Toán trực tuyến toàn diện, hiện đại được thiết kế theo phong cách giao diện macOS (Liquid Glass / Glassmorphism) mang lại trải nghiệm học tập mượt mà và tập trung.

## ✨ Tính Năng Nổi Bật

### 1. Landing Page & Xác thực
- **Thiết kế chuẩn Apple/macOS**: Sử dụng hiệu ứng backdrop-filter, shadow đa tầng và typography tinh tế.
- **Micro-animations**: Hiệu ứng cuộn mượt mà, sticky header, hover effects tạo cảm giác cao cấp.
- **Đăng nhập nhanh**: Quy trình xác thực bằng số điện thoại (Mô phỏng OTP) tiện lợi, không rườm rà.

### 2. Dashboard Thông Minh
- **Theo dõi tiến độ**: Biểu đồ Doughnut (Chart.js) thống kê bài học đã hoàn thành.
- **Countdown Timer**: Đồng hồ đếm ngược đến kỳ thi THPT Quốc Gia giúp học sinh quản lý thời gian.
- **Lịch học tuần (Weekly Calendar)**: Hiển thị sự kiện, livestream và bài tập theo thời gian thực.

### 3. Hệ Thống Khóa Học (Course Player)
- **Kiến trúc Data-Driven**: Nội dung khóa học (video, tài liệu, bài tập) được render linh hoạt từ file JSON.
- **Video & Tài liệu**: Tích hợp trình phát video tùy chỉnh, trình xem PDF/Tài liệu ngay trên trình duyệt mà không cần tải về.

### 4. Luyện Đề Thi Tương Tác (Exam Practice)
- **Tích hợp Markdown & LaTeX**: Hỗ trợ viết đề thi bằng Markdown, render công thức toán học sắc nét thông qua KaTeX.
- **Script Parser Tự Động**: Chuyển đổi hàng loạt đề thi từ định dạng `.md` sang `data.json` chỉ với một lệnh (`npm run parse-exams`).
- **Đa dạng câu hỏi theo chuẩn Bộ GD&ĐT**:
  - Trắc nghiệm 4 lựa chọn (Phần I).
  - Trắc nghiệm Đúng/Sai với điểm thành phần (Phần II).
  - Trắc nghiệm Điền đáp án ngắn (Phần III).
- **Trải nghiệm thi thực tế**:
  - Đồng hồ đếm ngược (Countdown Timer) tích hợp cảnh báo khi sắp hết giờ.
  - Bảng câu hỏi (Question Palette) theo dõi trạng thái trả lời (Đã làm, Chưa làm, Đúng một phần).
  - Tự động chấm điểm, hiển thị đáp án đúng/sai với màu sắc rõ ràng (Xanh/Đỏ) kèm lời giải.

## 🛠 Công Nghệ Sử Dụng
- **Core**: React 18, Vite.
- **Styling**: Vanilla CSS (tối ưu hóa biến CSS cho theme màu, glassmorphism).
- **Libraries**:
  - `react-router-dom`: Quản lý điều hướng.
  - `react-markdown`, `remark-math`, `rehype-katex`: Xử lý đề thi toán học.
  - `chart.js`, `react-chartjs-2`: Trực quan hóa dữ liệu Dashboard.

## 🚀 Hướng Dẫn Cài Đặt

1. **Clone repository**:
   ```bash
   git clone https://github.com/canar1406/thaytrieu.git
   cd thaytrieu
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```

3. **Chạy Parser (Nếu thêm đề thi mới trong `public/exams`)**:
   ```bash
   npm run parse-exams
   ```

4. **Chạy Development Server**:
   ```bash
   npm run dev
   ```

5. **Build cho Production**:
   ```bash
   npm run build
   ```

---
*Dự án được xây dựng với mục tiêu mang lại trải nghiệm giáo dục tốt nhất cho học sinh chuẩn bị cho kỳ thi THPT Quốc Gia.*
