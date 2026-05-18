@echo off
chcp 65001 >nul
title 云上田园 - 停止服务

echo.
echo ╔══════════════════════════════════════════╗
echo ║         🛑 云上田园 - 停止服务           ║
echo ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 停止服务
echo [信息] 正在停止服务...
node scripts/stop.js

echo.
echo 按任意键退出...
pause >nul
