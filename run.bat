@echo off
echo Starting Backend and Frontend...

REM Start backend server in a new window
echo Starting backend (npm run dev)...
start cmd /k "cd backend && npm run dev"

REM Start frontend server in a new window
timeout /t 2
echo Starting frontend (npm run start)...
start cmd /k "cd sidemi && npm run start"

echo Both servers are running!
echo Backend: will be available shortly
echo Frontend: will be available shortly
