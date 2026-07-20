# Thiết lập Supabase cho Toán Thầy Triều

Ứng dụng chạy theo mô hình GitHub Pages + Supabase; không cần host Node.js.

## 1. Tạo project

1. Tạo project tại Supabase.
2. Mở **SQL Editor**, chạy toàn bộ `supabase/migrations/001_initial_schema.sql`.
3. Trong **Authentication > URL Configuration**, đặt Site URL thành URL GitHub Pages và thêm redirect URL tương ứng.

## 2. Cấu hình máy local

Copy `.env.example` thành `.env`:

```env
VITE_SUPABASE_URL=https://PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=publishable-key
SUPABASE_SERVICE_ROLE_KEY=service-role-key
```

`SUPABASE_SERVICE_ROLE_KEY` chỉ dùng để import lần đầu. Không commit `.env`, không đặt key này trong biến bắt đầu bằng `VITE_`.

## 3. Import dữ liệu hiện có

Sau khi chạy migration:

```powershell
npm run supabase:import
```

Script nhập khóa học, đề thi, tài khoản và quyền từ `private/data`. Mật khẩu cũ không được tái sử dụng; terminal sẽ in mật khẩu tạm mới cho các tài khoản vừa tạo.

## 4. Deploy Edge Function quản lý học viên

Cài Supabase CLI, đăng nhập và liên kết project, sau đó:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy admin-users
```

Function kiểm tra người gọi là admin trước khi tạo, sửa, xóa tài khoản hoặc cấp khóa học. Service-role key chỉ tồn tại phía Supabase Function.

## 5. Cấu hình GitHub Pages

Trong repository GitHub, mở **Settings > Secrets and variables > Actions > Variables**, tạo:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Push nhánh `main`; workflow sẽ build và deploy GitHub Pages. Anon/publishable key được phép xuất hiện trong frontend vì quyền thực tế được khóa bằng RLS. Tuyệt đối không thêm service-role key vào GitHub Pages.

## 6. Kiểm tra bắt buộc

- Student chỉ thấy khóa có bản ghi trong `course_enrollments`.
- Gọi trực tiếp khóa khác phải không trả dữ liệu.
- Student không đọc được bảng `profiles` của người khác.
- Student không insert/update/delete khóa học hoặc enrollment.
- Admin có thể quản lý học viên qua `/admin`.

## Lưu ý nội dung

Video YouTube/Google Drive có link công khai vẫn có thể được người học hợp lệ chia sẻ. PDF cần bảo vệ nên đặt trong Supabase Storage bucket private và cấp URL có thời hạn.
