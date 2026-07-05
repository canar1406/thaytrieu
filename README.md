# 📚 Toán Thầy Triều — Nền Tảng Học Trực Tuyến

> Một nền tảng học Toán online toàn diện, thiết kế theo phong cách **Glassmorphism** hiện đại, giúp học sinh học tập và giáo viên quản lý nội dung dễ dàng mà không cần biết lập trình.

---

## ✨ Toàn Bộ Tính Năng Của Website

### 🌐 Trang Chủ (Landing Page)
- Giao diện đẹp, hiện đại với hiệu ứng cuộn mượt (GSAP animations)
- Hiển thị thông tin giáo viên, thành tích, bảng thành tích thi cử
- Biểu đồ radar năng lực chuyên môn (Chart.js)
- **Form đăng ký học thử**: Tự động gửi email về hộp thư của thầy qua EmailJS
- **Danh sách khoá học trong form** tự động đồng bộ với danh sách thật trên hệ thống (real-time, không cần sửa code)
- Nút "Đăng nhập / Vào học" tùy theo trạng thái đăng nhập

### 🔐 Đăng Nhập / Xác Thực
- Học sinh đăng nhập bằng **Email + Mật khẩu** do thầy cấp
- Hệ thống kiểm tra quyền xem khoá học — học sinh chỉ vào được khoá học được phép

### 📊 Dashboard Học Sinh
- Biểu đồ tiến độ học tập dạng Doughnut (đã hoàn thành / còn lại)
- **Đồng hồ đếm ngược** đến kỳ thi THPT Quốc Gia
- **Lịch học tuần** hiển thị các buổi học, livestream, bài tập theo ngày
- Danh sách **khoá học được phép xem** (được thầy cấp quyền)

### 📖 Hệ Thống Khoá Học (Course Player)
- Nội dung khoá học (video, tài liệu, bài tập) được tổ chức theo **chương học**
- Tự động nhận diện link **YouTube** → chuyển sang embed video
- Tự động nhận diện link **Google Drive** → chuyển sang chế độ xem tài liệu trực tiếp
- Học sinh đánh dấu **hoàn thành bài học**, tiến độ được lưu lại

### 📝 Luyện Đề Thi Tương Tác
- Hỗ trợ **công thức toán học** (LaTeX/KaTeX) hiển thị đẹp như sách giáo khoa
- **3 loại câu hỏi** theo chuẩn Bộ GD&ĐT:
  - Phần I: Trắc nghiệm 4 lựa chọn (A/B/C/D)
  - Phần II: Đúng/Sai với điểm thành phần
  - Phần III: Điền đáp án số ngắn
- **Đồng hồ đếm ngược** trong khi thi
- **Bảng câu hỏi** để nhảy nhanh giữa các câu
- **Tự động chấm điểm** và xem **lời giải chi tiết** sau khi nộp bài

### 🛠️ Trang Quản Trị Admin (Admin Tool)
- Đăng nhập bảo mật bằng email + mật khẩu Admin
- **Quản lý Học sinh**: Thêm, sửa, xóa, cấp quyền xem khoá học
- **Quản lý Khoá học**: Tạo/xóa khoá học, thêm chương, bài học (video/PDF)
- **Quản lý Đề thi**: Thêm, xóa đề thi luyện tập
- **Đồng bộ lên Web (1 nút bấm)**: Tự động đẩy toàn bộ thay đổi lên trang web chính thức

---

## 👨‍🏫 HƯỚNG DẪN SỬ DỤNG TRANG ADMIN — DÀNH CHO THẦY TRIỀU

> 💡 **Không cần biết lập trình!** Trang Admin được thiết kế để bất kỳ ai cũng có thể dùng được.

---

### BƯỚC 1 — Khởi động hệ thống (Làm mỗi lần dùng Admin)

Trước khi vào trang Admin, cần chạy 2 chương trình nền:

1. Mở thư mục `triều` trên màn hình desktop
2. **Bấm đúp chuột** vào file **`start-admin.bat`** → Cửa sổ đen hiện ra, **KHÔNG đóng cửa sổ đen này lại!**
3. Mở trình duyệt (Chrome/Edge), vào địa chỉ: **`http://localhost:5173/admin`**
4. Đăng nhập bằng **Email Admin** và **Mật khẩu Admin** của thầy

> ⚠️ **Nếu không chạy `start-admin.bat` trước thì trang Admin sẽ báo lỗi và không lưu được gì!**

---

### BƯỚC 2 — Quản lý Học Sinh

Dùng để **thêm học sinh mới, sửa thông tin, cấp quyền xem khoá học**.

#### ➕ Thêm học sinh mới:
1. Bấm nút **`+ Thêm học sinh`** (góc trên bên phải)
2. Một dòng trống mới xuất hiện ở cuối bảng
3. Điền vào các ô:
   - **Tên**: Họ tên đầy đủ của học sinh
   - **Email**: Email học sinh dùng để đăng nhập (ví dụ: `nguyenvana@gmail.com`)
   - **Mật khẩu**: Mật khẩu thầy đặt cho học sinh (ví dụ: `hocsinh123`)
   - **Quyền**: Chọn `Học sinh` (mặc định)
4. Trong cột **"Khoá học được xem"**: **Tick vào ô vuông** của từng khoá học muốn cho học sinh đó xem
5. Bấm nút **`Lưu thay đổi`** để lưu lại

#### ✏️ Sửa thông tin học sinh:
- Bấm trực tiếp vào ô cần sửa, gõ thông tin mới
- Bấm **`Lưu thay đổi`** sau khi sửa xong

#### 🗑️ Xóa học sinh:
- Bấm chữ **`Xóa`** (màu đỏ) ở cuối dòng học sinh đó
- Xác nhận → học sinh bị xóa khỏi hệ thống

> ⚠️ **Quan trọng**: Sau khi thêm/sửa học sinh, luôn bấm **`Lưu thay đổi`** — nếu không dữ liệu sẽ mất khi tải lại trang!

---

### BƯỚC 3 — Quản lý Khoá Học

Dùng để **thêm khoá học mới, thêm bài học, thêm video/tài liệu**.

#### ➕ Tạo khoá học mới:
1. Bấm nút **`+ Tạo Khóa học mới`** (góc trên bên phải)
2. Một hộp thoại hiện lên, gõ **tên khoá học** vào (ví dụ: `Lớp 12 THPT Quốc Gia 9+`)
3. Bấm **OK** → Khoá học mới xuất hiện trong danh sách

#### ✏️ Chỉnh sửa nội dung khoá học:
1. Bấm nút **`Chỉnh sửa nội dung`** của khoá học muốn sửa
2. Giao diện chi tiết hiện ra với:
   - **Danh sách chương học** bên trái
   - **Nội dung bài học** bên phải
3. Bấm **`+ Thêm chương`** để tạo chương mới (ví dụ: `Chương 1: Hàm số`)
4. Chọn một chương → Bấm **`+ Thêm bài học`** trong chương đó
5. Điền thông tin bài học:
   - **Tên bài**: Tên bài học
   - **Loại**: Chọn `video` hoặc `document` (tài liệu PDF)
   - **Đường dẫn (URL)**: Dán link YouTube hoặc Google Drive vào đây
6. Bấm **`Lưu khoá học`** để lưu toàn bộ thay đổi

#### 💡 Cách lấy link YouTube:
- Vào video YouTube → Bấm **`Chia sẻ`** → **`Sao chép liên kết`** → Dán vào ô URL

#### 💡 Cách lấy link Google Drive:
- Vào Google Drive → Chuột phải vào file → **`Lấy đường liên kết`** → **`Bất kỳ ai có đường liên kết`** → **`Sao chép liên kết`** → Dán vào ô URL

#### 🗑️ Xóa khoá học:
- Bấm **`Xóa`** (màu đỏ) → Xác nhận → Khoá học bị xóa vĩnh viễn

---

### BƯỚC 4 — Quản lý Đề Thi

Dùng để **thêm đề thi luyện tập mới vào hệ thống**.

1. Bấm vào tab **`Quản lý Đề thi`** ở menu bên trái
2. Bấm **`+ Thêm đề thi`**
3. Gõ tên đề thi (ví dụ: `Đề thử THPT Quốc Gia 2025 - Đề số 1`)
4. Điền đường dẫn file đề thi (hỏi lập trình viên nếu cần hỗ trợ thêm file)
5. Bấm **`Lưu`**

---

### BƯỚC 5 — Đồng Bộ Lên Web (Quan Trọng Nhất!)

> 🌐 Sau khi thêm/sửa bất cứ thứ gì, **phải đồng bộ lên Web** thì học sinh mới thấy được thay đổi!

1. Bấm vào mục **`☁️ Đồng bộ lên Web`** ở góc dưới menu bên trái
2. Bấm nút lớn **`Đồng bộ lên Web`**
3. Xác nhận → Hệ thống tự động đẩy toàn bộ lên internet
4. **Đợi 1–2 phút** → Trang web chính thức đã cập nhật!

> ✅ Thầy sẽ thấy thông báo "Đã đồng bộ lên Web thành công!" khi hoàn tất

---

## ❗ Các Lỗi Thường Gặp & Cách Xử Lý

### ❌ Lỗi 1: "Không thể kết nối đến Local Server"
**Nguyên nhân**: Chưa chạy `start-admin.bat` hoặc cửa sổ đen bị đóng.

**Cách sửa**:
1. Tìm file `start-admin.bat` trong thư mục `triều`
2. Bấm đúp chuột để chạy lại
3. **KHÔNG đóng cửa sổ đen** → Tải lại trang Admin (F5)

---

### ❌ Lỗi 2: Bấm "Lưu thay đổi" nhưng không thấy cập nhật
**Nguyên nhân**: Đã lưu vào máy tính nhưng chưa đồng bộ lên web.

**Cách sửa**:
1. Vào mục **`☁️ Đồng bộ lên Web`**
2. Bấm đồng bộ → Đợi 1–2 phút → Kiểm tra lại trang web

---

### ❌ Lỗi 3: Học sinh nói "Không thấy khoá học"
**Nguyên nhân**: Chưa cấp quyền xem khoá học cho học sinh đó.

**Cách sửa**:
1. Vào **Quản lý Học sinh**
2. Tìm dòng của học sinh đó
3. Ở cột **"Khoá học được xem"**: Tick vào khoá học muốn cấp
4. Bấm **`Lưu thay đổi`** → **Đồng bộ lên Web**

---

### ❌ Lỗi 4: Học sinh không đăng nhập được
**Nguyên nhân**: Email hoặc mật khẩu nhập sai, hoặc chưa lưu sau khi thêm.

**Cách sửa**:
1. Vào **Quản lý Học sinh** → Kiểm tra lại Email và Mật khẩu của học sinh đó
2. Đảm bảo đã bấm **`Lưu thay đổi`** sau khi thêm/sửa
3. Đồng bộ lên Web nếu cần

---

### ❌ Lỗi 5: Form đăng ký trên trang chủ không gửi email
**Nguyên nhân**: Thông tin EmailJS chưa được cấu hình đúng.

**Cách sửa**: Liên hệ lập trình viên để kiểm tra `SERVICE_ID`, `TEMPLATE_ID`, `PUBLIC_KEY` trong file `src/pages/LandingPage.jsx`.

---

### ❌ Lỗi 6: Trang web không cập nhật dù đã đồng bộ
**Nguyên nhân**: Trình duyệt đang lưu cache cũ.

**Cách sửa**: Bấm **`Ctrl + Shift + R`** (Windows) hoặc **`Cmd + Shift + R`** (Mac) để tải lại trang và xóa cache.

---

### ❌ Lỗi 7: Video không phát được
**Nguyên nhân**: Link YouTube không đúng định dạng hoặc link Google Drive chưa chia sẻ công khai.

**Cách sửa**:
- **YouTube**: Dùng link dạng `https://www.youtube.com/watch?v=...` (không dùng link rút gọn `youtu.be`)
- **Google Drive**: Đảm bảo đã chọn quyền **"Bất kỳ ai có đường liên kết"** khi chia sẻ

---

## 🚀 Hướng Dẫn Cài Đặt (Dành Cho Lập Trình Viên)

```bash
# 1. Clone repository
git clone https://github.com/canar1406/thaytrieu.git
cd thaytrieu

# 2. Cài đặt thư viện
npm install

# 3. Chạy Admin Backend Server
node admin-server.js
# Hoặc bấm đúp vào start-admin.bat (Windows)

# 4. Chạy Development Server
npm run dev
```

Sau đó truy cập:
- **Trang chủ**: `http://localhost:5173/`
- **Trang Admin**: `http://localhost:5173/admin`
- **Dashboard học sinh**: `http://localhost:5173/dashboard`

---

## 🔧 Cấu Trúc Dữ Liệu

| File | Mô tả |
|------|-------|
| `public/data/users.json` | Danh sách học sinh & quyền truy cập |
| `public/data/courses/course-list.json` | Danh sách khoá học |
| `public/data/courses/course-{id}.json` | Nội dung chi tiết từng khoá học |
| `public/data/exams.json` | Danh sách đề thi |

---

## 📚 Công Nghệ Sử Dụng

| Loại | Công nghệ |
|------|-----------|
| Frontend | React 18 + Vite |
| Animations | GSAP + ScrollTrigger |
| Charts | Chart.js + react-chartjs-2 |
| Math Rendering | KaTeX + remark-math |
| Email | EmailJS |
| Routing | react-router-dom |
| Admin Backend | Node.js + Express |
| Styling | Vanilla CSS (Glassmorphism) |
| Hosting | GitHub Pages |

---

*Dự án được xây dựng với mục tiêu mang lại trải nghiệm giáo dục tốt nhất cho học sinh chuẩn bị cho kỳ thi THPT Quốc Gia.*
