@echo off
chcp 65001 >nul
where node >nul 2>nul || (
  echo [LOI] Chua cai Node.js: https://nodejs.org/
  pause
  exit /b 1
)
if not exist .env (
  echo [LOI] Chua co file .env. Hay copy .env.example thanh .env va dien thong tin Supabase.
  pause
  exit /b 1
)
call npm install --no-audit --no-fund
start "Web App" cmd /k "npm run dev"
timeout /t 3 >nul
start http://localhost:5173/#/admin
