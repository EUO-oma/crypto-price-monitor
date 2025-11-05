@echo off
echo ====================================
echo  Netlify 자동 배포 스크립트
echo ====================================
echo.

:: 현재 날짜와 시간 가져오기
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set year=%datetime:~0,4%
set month=%datetime:~4,2%
set day=%datetime:~6,2%
set hour=%datetime:~8,2%
set minute=%datetime:~10,2%

:: 커밋 메시지 생성
set commit_message="Update: %year%-%month%-%day% %hour%:%minute%"

echo [1/4] Git 상태 확인 중...
git status

echo.
echo [2/4] 변경사항 스테이징...
git add .

echo.
echo [3/4] 커밋 생성 중...
git commit -m %commit_message%

echo.
echo [4/4] 원격 저장소로 푸시 중...
git push origin main

echo.
echo ====================================
echo  ✅ 배포 완료!
echo  1-2분 후 https://euo.netlify.app 에서 확인하세요
echo ====================================
pause