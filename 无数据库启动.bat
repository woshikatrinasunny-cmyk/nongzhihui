@echo off
chcp 65001 >nul
echo ========================================
echo 农智汇 - 无数据库模式启动
echo ========================================
echo.
echo 正在启动后端服务器（纯实时聚合模式）...
echo.

cd server
start "农智汇后端" cmd /k "node app.js"

echo.
echo ✓ 后端服务已启动在 http://localhost:3000
echo.
echo 提示：
echo 1. 此模式不需要MongoDB数据库
echo 2. 所有数据来自实时聚合和模拟数据
echo 3. 按Ctrl+C可停止服务器
echo.
echo ========================================
pause
