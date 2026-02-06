@echo off
chcp 65001 >nul
echo ========================================
echo 检查小程序API请求前缀
echo ========================================
echo.

echo 正在搜索缺少 /api 前缀的请求...
echo.

findstr /S /N /C:"get('/" miniprogram\pages\*.js | findstr /V "/api"
findstr /S /N /C:"post('/" miniprogram\pages\*.js | findstr /V "/api"
findstr /S /N /C:"wx.request" miniprogram\pages\*.js | findstr /V "/api"

echo.
echo 检查完成！
echo 如果没有输出，说明所有请求都已添加 /api 前缀
echo ========================================
pause
