# ĐẶC TẢ YÊU CẦU PHẦN MỀM (PRD/SPECS)
## DỰ ÁN: NỀN TẢNG HỌC TIẾNG ANH TRỰC TUYẾN 

---

### 1. TỔNG QUAN DỰ ÁN
Xây dựng một website học toán cá nhân hóa (1-kèm-1). Nền tảng cho phép quản lý học viên, cung cấp lộ trình học tập chi tiết, phát video bài giảng, xem tài liệu, và theo dõi tiến độ học tập một cách tự động.

**Định hướng hạ tầng:** - Nền tảng tĩnh (Static Web) không cần backend server phức tạp. 
- Dữ liệu cấu trúc bài học lưu trữ dạng file `.json` trên GitHub.
- Dữ liệu media (Video Record, File PDF/Docs) được lưu trữ trên Google Drive và nhúng (embed) trực tiếp vào website thông qua link/ID.
- Hosting: GitHub Pages (hoặc Vercel/Netlify).

---

### 2. PHONG CÁCH THIẾT KẾ & TRẢI NGHIỆM NGƯỜI DÙNG (UI/UX)
- **Phong cách thẩm mỹ:** Hiện đại (Modern), trẻ trung (Youthful Gen Z), tối giản (Minimalism) nhưng phải bắt mắt.
- **Cảm hứng "Toán học" & Logic:** Bố cục sử dụng lưới (Grid) chuẩn xác, đường nét dứt khoát. Tích hợp các hình khối hình học (đường thẳng, vòng tròn, khối hộp bo góc mềm mại) và các biểu đồ (Pie/Doughnut Chart) để thể hiện số liệu, tạo cảm giác tư duy phân tích và lộ trình rõ ràng.
- **Màu sắc:** Tươi sáng và tràn đầy năng lượng. Sử dụng tone màu chủ đạo (Primary) là Xanh dương/Xanh Navy, kết hợp với các mảng màu gradient phụ trợ như Xanh Cyan, Tím, hoặc Cam để tạo điểm nhấn (Highlight/Accent).
- **Hiệu ứng (Animations):** Chuyển cảnh cực kỳ mượt mà, không giật lag. Bắt buộc sử dụng các thư viện như GSAP & ScrollTrigger để tạo hiệu ứng micro-interactions (hover, click, loading, scroll fade-in, trượt slide).

---

### 3. CHI TIẾT CÁC TRANG & TÍNH NĂNG

#### 3.1. Landing Page (Trang Giới Thiệu / Home)
- **Hero Section:** Banner ấn tượng với tiêu đề thu hút, có call-to-action (CTA) mạnh mẽ. Có thể thêm hiệu ứng particles (hạt trôi nổi) ở background.
- **Profile Giáo viên (Teacher Section):** Tích hợp nổi bật ngay trên Landing Page dưới dạng Card hoặc khu vực riêng. Cần hiển thị:
  - Avatar chuyên nghiệp.
  - Thành tích nổi bật
  - Tóm tắt thế mạnh giảng dạy.
- **Form Đăng ký Khóa học:**
  - Các trường thông tin: Họ tên, Email, Số điện thoại, Khóa học muốn đăng ký (Dropdown), Ghi chú thêm.
  - **Logic:** Tích hợp EmailJS (hoặc API tương đương) để khi người dùng nhấn "Đăng ký", hệ thống tự động gửi email thông báo kèm dữ liệu form trực tiếp về email của quản trị viên, không cần qua backend trung gian.

#### 3.2. Dashboard (Bảng Điều Khiển Của Học Viên)
*Chỉ truy cập được sau khi đăng nhập thành công.*
- **Header:** Lời chào cá nhân hóa (VD: "Chào buổi sáng, [Tên học viên]").
- **Widget Đếm ngược:** Khối hiển thị thời gian đếm ngược đến ngày thi mục tiêu (Ví dụ: Kỳ thi THPT Quốc Gia).
- **Lịch học trong tuần:** - Hiển thị giao diện thứ trong tuần (T2 - CN). 
  - Đánh dấu các ngày có lịch học, hiển thị danh sách các ca học sắp tới (Thời gian, Tên bài học).
- **Khóa học đang tham gia:** Hiển thị dưới dạng thẻ (Course Card) bao gồm hình ảnh, tên khóa học, và một thanh tiến độ nhỏ.
- **Tiến độ học tập tổng quan:** Biểu đồ vòng tròn (Doughnut Chart) hiển thị % bài học đã hoàn thành so với tổng lộ trình.

#### 3.3. Trang Chi Tiết Khóa Học (Course Page)
- **Header:** Hiển thị Tên khóa học và **Thanh Tiến Độ Học Tập (Progress Bar)** của riêng khóa học đó trên cùng.
- **Giao diện Split-View (Chia đôi màn hình):**
  - **Cột Trái (Sidebar - Mục lục):** - Hiển thị danh sách bài học (Index) được phân cấp theo cấu trúc folder lưu trên GitHub (Ví dụ: Tuần 1 -> Buổi 1 -> Các file tài liệu/video).
    - Có khả năng mở rộng/thu gọn (Accordion).
    - Hiển thị icon trạng thái bên cạnh mỗi file (Đã học / Chưa học).
  - **Cột Phải (Nội dung chính):** - Là khu vực trình chiếu (Viewer). Dựa vào loại file người dùng click ở cột trái, hệ thống sẽ render iframe tương ứng.
    - **Video & File Drive:** Nhúng trực tiếp iframe player/viewer của Google Drive vào khu vực này.
- **Cơ chế tính tiến độ học tập (Tracking Logic):**
  - Khi học viên click vào một file (PDF hoặc Video) ở mục lục trong một ngày cụ thể, hệ thống sẽ bắt sự kiện click và tự động đánh dấu bài học đó là "Đã hoàn thành".
  - Frontend tính toán: `% Tiến độ = (Số file đã click xem / Tổng số file trong JSON cấu trúc khóa học) * 100`.
  - Trạng thái hoàn thành được lưu cục bộ (Local Storage/Session Storage) để duy trì tiến độ.

#### 3.4. Trang Đăng Nhập (Login Page)
- Form đăng nhập cơ sở: Email & Mật khẩu.
- Hiệu ứng báo lỗi rung lắc (Shake) nếu sai thông tin.
- **Logic xác thực:** Đọc và đối chiếu dữ liệu từ file tĩnh `users.json` lưu trên hệ thống để xác thực và cấp quyền vào Dashboard.

---

### 4. CẤU TRÚC DỮ LIỆU ĐỀ XUẤT (JSON)
Quản trị viên sẽ cập nhật nội dung qua việc chỉnh sửa file JSON trên GitHub. Cấu trúc yêu cầu:
- **`users.json`**: Chứa thông tin đăng nhập, danh sách các `course_id` mà học viên được phép truy cập.
- **`course-data-{id}.json`**: Chứa cấu trúc khóa học. Map theo dạng: Mảng `weeks` -> Mảng `sessions` -> Mảng `files`. Mỗi file sẽ chứa các key: `file_id`, `name`, `type` (video/pdf), và `drive_id` để frontend gọi iframe nhúng.