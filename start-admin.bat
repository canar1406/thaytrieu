@echo off
chcp 65001 >nul
echo 🎓 DANG KHOI DONG CONG CU QUAN TRI ADMIN - TOAN THAY TRIEU 🎓
echo =============================================================

REM Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh cua Thay chua cai dat Node.js!
    echo Vui long tai va cai dat Node.js tu dia chi: https://nodejs.org/
    echo Bam Next lien tuc de cai dat. Sau khi cai xong, hay mo lai file nay nhe.
    start https://nodejs.org/
    pause
    exit
)

REM Kiem tra Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh cua Thay chua cai dat Git!
    echo Git can thiet de day noi dung len trang web.
    echo Vui long tai va cai dat tu dia chi: https://git-scm.com/
    start https://git-scm.com/downloads
    pause
    exit
)

echo [OK] Da tim thay Node.js va Git!
echo Dang cai dat/cap nhat thu vien can thiet (vui long doi vai giay)...
call npm install express cors --no-audit --no-fund >nul 2>nul

echo Dang khoi dong may chu Local API (Port 3001)...
start "Admin API Server" cmd /k "node admin-server.js"

echo Dang khoi dong may chu Web App (Port 5173)...
start "Web App Server" cmd /k "npm run dev"

echo =============================================================
echo MOI THU DA SAN SANG!
echo Trinh duyet se tu dong mo trang Admin ngay bay gio...
timeout /t 3 >nul
start http://localhost:5173/admin
