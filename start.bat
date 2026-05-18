@echo off
chcp 65001 >nul
title 云上田园 - 启动服务

echo.
echo ╔══════════════════════════════════════════╗
echo ║         🌱 云上田园 - 启动服务           ║
echo ╚══════════════════════════════════════════╝
echo.

cd /d "%~dp0"

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

:: 检查 Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Python，请先安装 Python
    pause
    exit /b 1
)

:: 安装依赖（如果需要）
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    call npm install
)

:: 启动服务
echo [信息] 正在启动服务...
node scripts/start.js

pause
