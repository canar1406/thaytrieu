# Toán Thầy Triều — Hướng dẫn sử dụng

Website học Toán trực tuyến dành cho học viên của thầy Triều.

**Địa chỉ website:** https://canar1406.github.io/thaytrieu/

Website sử dụng:

- GitHub Pages để hiển thị giao diện.
- Supabase để đăng nhập, lưu dữ liệu và kiểm tra quyền xem khóa học.
- Học viên chỉ đọc được những khóa đã được thầy cấp quyền.

> Không đưa mật khẩu, Secret Key hoặc Service Role Key lên GitHub, Zalo, Facebook hay ảnh chụp màn hình.

---

## 1. Hướng dẫn dành cho học viên

### Đăng nhập

1. Mở website: https://canar1406.github.io/thaytrieu/
2. Bấm **Đăng nhập**.
3. Nhập email và mật khẩu được thầy cung cấp.
4. Bấm **Vào lớp học**.

Sau khi đăng nhập, học viên chỉ nhìn thấy những khóa học đã được cấp.

### Mở khóa học

1. Trong Dashboard, bấm mục **Khóa học** ở menu bên trái.
2. Chọn khóa muốn học.
3. Chọn chương và bài học.
4. Video hoặc PDF sẽ xuất hiện ở phần chính.

Nếu không nhìn thấy khóa đã đăng ký, hãy liên hệ thầy để kiểm tra quyền.

### Làm đề thi

1. Trong Dashboard, chọn **Luyện đề**.
2. Chọn đề thi.
3. Bấm **Bắt đầu làm bài**.
4. Hoàn thành các câu hỏi rồi bấm **Nộp bài**.

### Đăng xuất

Bấm vào khu vực tài khoản ở góc dưới menu bên trái. Không lưu mật khẩu trên máy tính công cộng.

---

## 2. Hướng dẫn dành cho thầy — công việc hằng ngày

### Mở trang quản trị

1. Mở: https://canar1406.github.io/thaytrieu/#/admin
2. Nhập email và mật khẩu Admin.
3. Bấm **Đăng nhập**.

Không cần mở `start-admin.bat`, không cần chạy máy chủ và không cần bấm Git Push. Mọi thay đổi trong trang quản trị được lưu trực tiếp vào Supabase.

### Thêm học viên mới

1. Vào tab **Quản lý học sinh**.
2. Bấm **+ Thêm học sinh**.
3. Nhập:
   - Họ và tên.
   - Email đăng nhập.
   - Mật khẩu ban đầu, tối thiểu 8 ký tự.
   - Quyền: chọn **Học sinh**.
4. Tick những khóa học sinh được phép xem.
5. Bấm **Lưu thay đổi**.
6. Gửi email và mật khẩu cho học viên qua tin nhắn riêng.

Không dùng một mật khẩu chung cho tất cả học viên.

### Cấp hoặc thu hồi khóa học

1. Vào **Quản lý học sinh**.
2. Tìm đúng học viên.
3. Trong cột **Khóa học được xem**:
   - Tick để cấp quyền.
   - Bỏ tick để thu hồi quyền.
4. Bấm **Lưu thay đổi**.

Quyền mới có hiệu lực ngay. Học viên có thể cần tải lại trang hoặc đăng nhập lại.

### Đổi mật khẩu học viên

1. Tìm học viên trong **Quản lý học sinh**.
2. Nhập mật khẩu mới vào ô mật khẩu.
3. Bấm **Lưu thay đổi**.

Nếu không muốn đổi mật khẩu, để trống ô này.

### Xóa học viên

1. Tìm đúng học viên.
2. Bấm **Xóa**.
3. Kiểm tra lại tên và email.
4. Xác nhận rồi bấm **Lưu thay đổi**.

Xóa tài khoản sẽ xóa cả quyền khóa học của tài khoản đó. Không thể đăng nhập lại bằng tài khoản đã xóa.

### Tạo khóa học

1. Vào tab **Quản lý khóa học**.
2. Bấm **+ Tạo khóa học mới**.
3. Nhập tên khóa học.
4. Bấm **Chỉnh sửa nội dung**.
5. Điền mô tả, chương và bài học.
6. Bấm **Lưu nội dung**.

### Thêm bài học

Mỗi bài học cần có:

- Loại nội dung: Video hoặc PDF.
- Tên bài học.
- Đường dẫn nội dung.

Với YouTube, dùng link video đầy đủ. Với tài liệu cần bảo mật, không nên đặt Google Drive ở chế độ “Bất kỳ ai có liên kết”; nên sử dụng kho lưu trữ riêng tư.

### Xóa khóa học

1. Vào **Quản lý khóa học**.
2. Kiểm tra chắc chắn đúng khóa.
3. Bấm **Xóa** và xác nhận.

Hành động này xóa nội dung khóa và toàn bộ quyền liên quan. Nên sao lưu trước khi xóa khóa quan trọng.

### Quản lý đề thi

1. Vào tab **Quản lý đề thi**.
2. Chọn đề để chỉnh sửa hoặc bấm tạo đề mới.
3. Nhập tên đề.
4. Bấm **Chọn file đề thi** và chọn file `.json` hoặc `.md` trên máy:
   - `.json`: đề tương tác, có chấm điểm tự động.
   - `.md`: đề văn bản, phù hợp để đọc hoặc in.
5. Kiểm tra tên file hiện dưới nút chọn file.
6. Bấm **Lưu đề thi**.

File được đọc và lưu trực tiếp vào database Supabase; không cần copy vào `public`, không cần upload Supabase Storage và không cần Git push. Mỗi file tối đa 2 MB. Với đề JSON, đáp án được giữ lại phía database và không gửi cho học viên trước khi nộp bài.

---

## 3. Những điều tuyệt đối không làm

- Không gửi `sb_secret_...` cho người khác.
- Không đưa Secret Key vào file `.env.production`.
- Không đăng ảnh có Secret Key lên mạng.
- Không sửa trực tiếp bảng dữ liệu khi chưa hiểu rõ.
- Không tắt Row Level Security (RLS).
- Không biến dữ liệu khóa học thành file JSON trong thư mục `public`.
- Không cấp quyền Admin cho học viên.
- Không dùng cùng một mật khẩu cho nhiều người.

Publishable Key bắt đầu bằng `sb_publishable_` được dùng trong website và không có quyền bỏ qua RLS. Secret Key bắt đầu bằng `sb_secret_` có quyền rất lớn và phải được giữ riêng tư.

---

## 4. Xử lý các lỗi thường gặp

### Học viên đăng nhập không được

Kiểm tra lần lượt:

1. Email có đúng chính tả không.
2. Có khoảng trắng thừa ở đầu hoặc cuối email không.
3. Mật khẩu có đúng chữ hoa, chữ thường không.
4. Tài khoản còn tồn tại trong trang quản trị không.
5. Thử đặt lại mật khẩu cho học viên.

### Học viên đăng nhập được nhưng không thấy khóa

1. Mở trang Admin.
2. Tìm học viên.
3. Tick đúng khóa học.
4. Bấm **Lưu thay đổi**.
5. Yêu cầu học viên đăng xuất rồi đăng nhập lại.

### Học viên nhập trực tiếp địa chỉ khóa khác

Supabase sẽ kiểm tra quyền tại database. Nếu chưa được cấp, nội dung không được trả về. Việc sửa URL hoặc `localStorage` không cấp thêm quyền.

### Trang trắng hoặc không tải được dữ liệu

1. Nhấn `Ctrl + Shift + R` để tải lại hoàn toàn.
2. Kiểm tra kết nối Internet.
3. Mở Supabase Dashboard và xem project có ở trạng thái Healthy không.
4. Mở GitHub → repository `thaytrieu` → tab **Actions** và kiểm tra lần triển khai mới nhất có dấu tích xanh.

### Trang Admin báo lỗi khi lưu học viên

Kiểm tra:

1. Edge Function `admin-users` đã được deploy chưa.
2. Người đang đăng nhập có role `admin` không.
3. Email học viên có bị trùng không.
4. Mật khẩu tài khoản mới có tối thiểu 8 ký tự không.

### Video hoặc PDF không mở được

- Kiểm tra đường dẫn có còn hoạt động không.
- Kiểm tra quyền chia sẻ của file.
- YouTube có cho phép nhúng video không.
- File đã bị chủ sở hữu xóa hoặc di chuyển chưa.

---

## 5. Sao lưu và bảo mật

### Sao lưu

Gói Supabase miễn phí không có đầy đủ cơ chế backup tự động như gói trả phí. Nên xuất dữ liệu định kỳ và lưu ở vị trí riêng tư.

Nên sao lưu trước khi:

- Xóa nhiều học viên.
- Xóa khóa học.
- Chạy lại migration SQL.
- Thay đổi RLS.

### Khi lộ Secret Key

1. Vào Supabase Dashboard.
2. Mở **Project Settings → API Keys**.
3. Rotate hoặc tạo Secret Key mới.
4. Cập nhật `SUPABASE_SERVICE_ROLE_KEY` trong `.env` trên máy.
5. Không cập nhật Secret Key vào GitHub Pages vì website không cần key này.

### Đổi mật khẩu Admin

Nên dùng mật khẩu dài, riêng biệt và bật MFA cho tài khoản quản lý Supabase. Không chia sẻ tài khoản Supabase Owner cho học viên hoặc cộng tác viên không cần thiết.

---

## 6. Cài đặt trên máy mới

Phần này chỉ cần thực hiện khi đổi máy hoặc cài lại dự án.

1. Cài Node.js từ https://nodejs.org/
2. Tải dự án từ GitHub.
3. Mở thư mục dự án.
4. Copy `.env.example` thành `.env`.
5. Điền Project URL, Publishable Key và Secret Key.
6. Mở terminal trong thư mục và chạy:

```powershell
npm install
npm run dev
```

7. Mở http://localhost:5173/

Không cần chạy import lần nữa nếu dữ liệu đã có trên Supabase.

---

## 7. Cập nhật giao diện lên GitHub Pages

Chỉ cần phần này khi mã nguồn giao diện được chỉnh sửa.

1. Commit thay đổi.
2. Push lên nhánh `main` của GitHub.
3. GitHub Actions tự động build và deploy.
4. Chờ khoảng 1–3 phút.
5. Kiểm tra tab **Actions** có dấu tích xanh.
6. Mở website và nhấn `Ctrl + Shift + R`.

Thay đổi học viên, quyền, khóa học và đề thi trong trang Admin được lưu trực tiếp vào Supabase nên không cần Git push.

---

## 8. Thông tin kỹ thuật dành cho người hỗ trợ

- Frontend: React + Vite.
- Routing: HashRouter, phù hợp GitHub Pages.
- Authentication: Supabase Auth.
- Database: Supabase PostgreSQL.
- Authorization: PostgreSQL Row Level Security.
- Admin user management: Supabase Edge Function `admin-users`.
- Migration: chạy lần lượt `supabase/migrations/001_initial_schema.sql`, rồi `supabase/migrations/002_exam_privacy_and_progress.sql`.
- Hướng dẫn thiết lập kỹ thuật: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md).

Các biến công khai dùng khi build:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

Biến tuyệt đối không được đưa vào frontend hoặc Git:

```env
SUPABASE_SERVICE_ROLE_KEY=...
```
