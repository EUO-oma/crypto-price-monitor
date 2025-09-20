#!/usr/bin/env python3
"""
Netlify 자동 배포 스크립트
Git 커밋과 푸시를 자동화합니다.
"""

import subprocess
import sys
from datetime import datetime
import os

def run_command(command):
    """명령어 실행 및 결과 출력"""
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 에러 발생: {e}")
        if e.stderr:
            print(f"에러 메시지: {e.stderr}")
        return False

def main():
    print("="*40)
    print(" Netlify 자동 배포 스크립트")
    print("="*40)
    print()
    
    # 프로젝트 디렉토리로 이동
    project_dir = "/Users/iuo/Documents/EUOvaultSYNC/1 Project/privacy/crypto-price-monitor"
    
    # 현재 디렉토리 확인
    current_dir = os.getcwd()
    print(f"현재 디렉토리: {current_dir}")
    
    # 프로젝트 디렉토리로 이동
    if current_dir != project_dir:
        try:
            os.chdir(project_dir)
            print(f"프로젝트 디렉토리로 이동: {project_dir}")
        except Exception as e:
            print(f"❌ 디렉토리 이동 실패: {e}")
            print(f"프로젝트 경로를 확인하세요: {project_dir}")
            return
    
    print()
    
    # 1. Git 상태 확인
    print("[1/4] Git 상태 확인 중...")
    if not run_command("git status"):
        print("Git 저장소가 아니거나 Git이 설치되지 않았습니다.")
        return
    
    # 2. 변경사항 확인
    print("\n[2/4] 변경사항 확인...")
    result = subprocess.run("git diff --stat", shell=True, 
                          capture_output=True, text=True)
    if not result.stdout:
        print("변경사항이 없습니다.")
        return
    print(result.stdout)
    
    # 사용자 확인
    response = input("\n위 변경사항을 커밋하고 배포하시겠습니까? (y/n): ")
    if response.lower() != 'y':
        print("배포가 취소되었습니다.")
        return
    
    # 커밋 메시지 입력 (선택사항)
    custom_message = input("\n커밋 메시지를 입력하세요 (엔터: 자동 생성): ").strip()
    
    if custom_message:
        commit_message = custom_message
    else:
        # 현재 시간으로 커밋 메시지 생성
        now = datetime.now()
        commit_message = f"Update: {now.strftime('%Y-%m-%d %H:%M')}"
    
    # 3. 변경사항 스테이징
    print(f"\n[3/4] 변경사항 스테이징...")
    if not run_command("git add ."):
        return
    
    # 4. 커밋
    print(f"\n[4/4] 커밋 생성 중... (메시지: {commit_message})")
    if not run_command(f'git commit -m "{commit_message}"'):
        print("커밋 생성에 실패했습니다.")
        return
    
    # 5. 푸시
    print("\n[5/5] 원격 저장소로 푸시 중...")
    if not run_command("git push origin main"):
        # main 브랜치가 없으면 master 시도
        print("main 브랜치 푸시 실패. master 브랜치 시도 중...")
        if not run_command("git push origin master"):
            print("푸시에 실패했습니다. 브랜치 이름을 확인하세요.")
            return
    
    print("\n" + "="*40)
    print(" ✅ 배포 완료!")
    print(" 1-2분 후 https://euo.netlify.app 에서 확인하세요")
    print("="*40)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n사용자에 의해 중단되었습니다.")
    except Exception as e:
        print(f"\n예상치 못한 오류 발생: {e}")
    
    # 맥에서도 결과를 확인할 수 있도록
    if sys.platform in ["darwin", "win32"]:  # darwin은 macOS
        input("\n엔터를 눌러 종료...")