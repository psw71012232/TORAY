@echo off
chcp 65001 > nul
echo ====================================================================
echo  [2026 부드럽 과정] GitHub 원격 저장소 동기화 (Push) 스크립트
echo  저장소: https://github.com/psw71012232/TORAY.git
echo ====================================================================
echo.

set "GIT_CMD=C:\Users\user\.gemini\antigravity\scratch\mingit\cmd\git.exe"

if not exist "%GIT_CMD%" (
    echo [오류] Git 실행 파일을 찾을 수 없습니다.
    pause
    exit /b 1
)

echo [1/3] 변경 사항을 스테이징 영역에 추가합니다...
"%GIT_CMD%" add .

echo [2/3] 커밋을 생성합니다...
"%GIT_CMD%" commit -m "update: 웹사이트 콘텐츠 업데이트" 2>nul

echo [3/3] GitHub로 전송(Push)을 진행합니다...
"%GIT_CMD%" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo [성공] GitHub에 정상적으로 업로드되었습니다!
    echo 배포 주소: https://psw71012232.github.io/TORAY/
) else (
    echo.
    echo [안내] 전송에 실패하였습니다.
    echo SSH 키 등록 또는 GitHub 개인 액세스 토큰(PAT) 인증이 필요합니다.
)

echo.
pause
