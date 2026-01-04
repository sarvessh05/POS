@echo off
echo Starting POS System...

:: Start Backend
start "POS Backend" cmd /k "cd backend && .venv\Scripts\activate && uvicorn main:app --reload"

:: Start Frontend
start "POS Frontend" cmd /k "cd frontend && npm run dev"

echo POS System started! 
echo Frontend: http://localhost:5173
echo Backend: http://127.0.0.1:8000
echo Credentials: admin / admin123
pause
