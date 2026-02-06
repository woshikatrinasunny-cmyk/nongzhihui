@echo off
chcp 65001 >nul
echo ========================================
echo 农智汇项目启动脚本
echo ========================================

echo.
echo [1/3] 启动MongoDB服务...
net start MongoDB
if errorlevel 1 (
    echo MongoDB启动失败，尝试手动启动...
    start "MongoDB" "D:\MongoDB\Server\8.2\bin\mongod.exe" --config "D:\MongoDB\mongod.cfg"
    timeout /t 3
)

echo.
echo [2/3] 启动后端服务...
cd /d "%~dp0server"
start "农智汇后端" cmd /k "npm run dev"

echo.
echo [3/3] 等待5秒...
timeout /t 5

echo.
echo ========================================
echo 启动完成！
echo.
echo 后端地址: http://localhost:3000
echo 健康检查: http://localhost:3000/health
echo.
echo 请在微信开发者工具中打开小程序项目
echo 项目路径: %~dp0miniprogram
echo ========================================
echo.
pause
