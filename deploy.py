#!/usr/bin/env python3
"""
🚀 Netlify Ultra Deploy - 원클릭 자동 배포 스크립트
"""

import subprocess
import sys
from datetime import datetime
import os
import time
import webbrowser

# 색상 코드 (ANSI)
class Colors:
    CYAN = '\033[96m'
    YELLOW = '\033[93m'
    GREEN = '\033[92m'
    RED = '\033[91m'
    MAGENTA = '\033[95m'
    BLUE = '\033[94m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def run_command(command, silent=False):
    """명령어 실행 및 결과 출력"""
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        if result.stdout and not silent:
            print(result.stdout)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        if not silent:
            print(f"{Colors.RED}❌ 에러 발생: {e}{Colors.RESET}")
            if e.stderr:
                print(f"에러 메시지: {e.stderr}")
        return False, e.stderr

def print_banner():
    """배너 출력"""
    print(f"""
{Colors.CYAN}╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  {Colors.YELLOW}🚀 NETLIFY ULTRA DEPLOY{Colors.CYAN}                                    ║
║                                                              ║
║  {Colors.WHITE}원클릭 자동 배포 시스템 v2.0{Colors.CYAN}                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝{Colors.RESET}
""")

def loading_animation(text, duration=2):
    """로딩 애니메이션"""
    chars = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    start_time = time.time()
    i = 0
    while time.time() - start_time < duration:
        print(f'\r{Colors.YELLOW}{chars[i % len(chars)]} {text}{Colors.RESET}', end='', flush=True)
        time.sleep(0.1)
        i += 1
    print(f'\r{Colors.GREEN}✓ {text}{Colors.RESET}')

def auto_deploy():
    """원클릭 자동 배포"""
    print(f"\n{Colors.MAGENTA}{Colors.BOLD}🎯 원클릭 배포 모드 시작!{Colors.RESET}")
    
    # 프로젝트 디렉토리로 이동
    project_dir = "/Users/iuo/Documents/EUOvaultSYNC/1 Project/privacy/crypto-price-monitor"
    
    current_dir = os.getcwd()
    if current_dir != project_dir:
        try:
            os.chdir(project_dir)
            print(f"{Colors.GREEN}✓ 프로젝트 디렉토리로 이동 완료{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}❌ 디렉토리 이동 실패: {e}{Colors.RESET}")
            return False
    
    # 1. Git 상태 확인
    loading_animation("Git 상태 확인 중", 1)
    success, _ = run_command("git status", silent=True)
    if not success:
        print(f"{Colors.RED}❌ Git 저장소가 아니거나 Git이 설치되지 않았습니다.{Colors.RESET}")
        return False
    
    # 2. 변경사항 스테이징
    loading_animation("변경사항 스테이징 중", 1.5)
    if not run_command("git add .", silent=True)[0]:
        print(f"{Colors.RED}❌ 스테이징 실패{Colors.RESET}")
        return False
    
    # 3. 커밋 생성
    now = datetime.now()
    commit_message = f"🚀 Auto Deploy: {now.strftime('%Y-%m-%d %H:%M:%S')}"
    loading_animation(f"커밋 생성 중: {commit_message}", 1.5)
    
    if not run_command(f'git commit -m "{commit_message}"', silent=True)[0]:
        # 변경사항이 없는 경우
        print(f"{Colors.YELLOW}ℹ️  변경사항이 없습니다.{Colors.RESET}")
        return False
    
    # 4. 푸시
    loading_animation("원격 저장소로 푸시 중", 2)
    success, _ = run_command("git push origin main", silent=True)
    if not success:
        success, _ = run_command("git push origin master", silent=True)
        if not success:
            print(f"{Colors.RED}❌ 푸시 실패. 브랜치를 확인하세요.{Colors.RESET}")
            return False
    
    return True

def manual_deploy():
    """수동 배포 (기존 방식)"""
    print(f"\n{Colors.BLUE}📝 수동 배포 모드{Colors.RESET}")
    
    # 프로젝트 디렉토리로 이동
    project_dir = "/Users/iuo/Documents/EUOvaultSYNC/1 Project/privacy/crypto-price-monitor"
    
    current_dir = os.getcwd()
    if current_dir != project_dir:
        try:
            os.chdir(project_dir)
            print(f"{Colors.GREEN}✓ 프로젝트 디렉토리로 이동{Colors.RESET}")
        except Exception as e:
            print(f"{Colors.RED}❌ 디렉토리 이동 실패: {e}{Colors.RESET}")
            return
    
    # Git 상태 확인
    print(f"\n{Colors.CYAN}[1/5] Git 상태 확인 중...{Colors.RESET}")
    if not run_command("git status")[0]:
        return
    
    # 변경사항 확인
    print(f"\n{Colors.CYAN}[2/5] 변경사항 확인...{Colors.RESET}")
    result = subprocess.run("git diff --stat", shell=True, 
                          capture_output=True, text=True)
    if not result.stdout:
        print(f"{Colors.YELLOW}변경사항이 없습니다.{Colors.RESET}")
        return
    print(result.stdout)
    
    # 사용자 확인
    response = input(f"\n{Colors.YELLOW}위 변경사항을 커밋하고 배포하시겠습니까? (y/n): {Colors.RESET}")
    if response.lower() != 'y':
        print(f"{Colors.RED}배포가 취소되었습니다.{Colors.RESET}")
        return
    
    # 커밋 메시지 입력
    custom_message = input(f"\n{Colors.YELLOW}커밋 메시지를 입력하세요 (엔터: 자동 생성): {Colors.RESET}").strip()
    
    if custom_message:
        commit_message = custom_message
    else:
        now = datetime.now()
        commit_message = f"Update: {now.strftime('%Y-%m-%d %H:%M:%S')}"
    
    # 스테이징
    print(f"\n{Colors.CYAN}[3/5] 변경사항 스테이징...{Colors.RESET}")
    if not run_command("git add .")[0]:
        return
    
    # 커밋
    print(f"\n{Colors.CYAN}[4/5] 커밋 생성 중... (메시지: {commit_message}){Colors.RESET}")
    if not run_command(f'git commit -m "{commit_message}"')[0]:
        return
    
    # 푸시
    print(f"\n{Colors.CYAN}[5/5] 원격 저장소로 푸시 중...{Colors.RESET}")
    if not run_command("git push origin main")[0]:
        if not run_command("git push origin master")[0]:
            print(f"{Colors.RED}푸시에 실패했습니다.{Colors.RESET}")
            return
    
    print(f"\n{Colors.GREEN}✅ 배포 완료!{Colors.RESET}")

def open_website():
    """웹사이트 열기"""
    url = "https://euo.netlify.app"
    print(f"\n{Colors.CYAN}🌐 웹사이트 열기: {url}{Colors.RESET}")
    webbrowser.open(url)

def main_menu():
    """메인 메뉴"""
    print_banner()
    
    while True:
        print(f"""
{Colors.CYAN}╭─────────────────────────────────────╮
│         {Colors.WHITE}메뉴를 선택하세요{Colors.CYAN}          │
├─────────────────────────────────────┤
│                                     │
│  {Colors.YELLOW}[1]{Colors.WHITE} 🚀 원클릭 자동 배포{Colors.CYAN}          │
│  {Colors.YELLOW}[2]{Colors.WHITE} 📝 수동 배포 (확인 포함){Colors.CYAN}     │
│  {Colors.YELLOW}[3]{Colors.WHITE} 🌐 웹사이트 열기{Colors.CYAN}              │
│  {Colors.YELLOW}[4]{Colors.WHITE} 🚪 종료{Colors.CYAN}                       │
│                                     │
╰─────────────────────────────────────╯{Colors.RESET}

{Colors.BOLD}💡 TIP:{Colors.RESET} 원클릭 배포는 확인 없이 즉시 배포합니다!
""")
        
        try:
            choice = input(f"{Colors.GREEN}👉 선택 (1-4): {Colors.RESET}").strip()
            
            if choice == '1':
                # 원클릭 자동 배포
                print(f"\n{Colors.YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}")
                if auto_deploy():
                    print(f"""
{Colors.GREEN}╔══════════════════════════════════════════╗
║                                          ║
║         🎉 배포 성공!                    ║
║                                          ║
╚══════════════════════════════════════════╝{Colors.RESET}
""")
                    print(f"{Colors.CYAN}ℹ️  1-2분 후 사이트에 반영됩니다.{Colors.RESET}")
                    
                    # 자동으로 웹사이트 열기
                    time.sleep(0.5)
                    print(f"\n{Colors.MAGENTA}🌐 웹사이트를 자동으로 열고 있습니다...{Colors.RESET}")
                    open_website()
                else:
                    print(f"\n{Colors.RED}배포 중 문제가 발생했습니다.{Colors.RESET}")
                
                print(f"\n{Colors.YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}")
                input(f"\n{Colors.CYAN}계속하려면 엔터를 누르세요...{Colors.RESET}")
                
            elif choice == '2':
                # 수동 배포
                print(f"\n{Colors.YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}")
                manual_deploy()
                print(f"\n{Colors.YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━{Colors.RESET}")
                input(f"\n{Colors.CYAN}계속하려면 엔터를 누르세요...{Colors.RESET}")
                
            elif choice == '3':
                # 웹사이트 열기
                open_website()
                input(f"\n{Colors.CYAN}계속하려면 엔터를 누르세요...{Colors.RESET}")
                
            elif choice == '4':
                # 종료
                print(f"\n{Colors.YELLOW}👋 배포 스크립트를 종료합니다.{Colors.RESET}")
                print(f"{Colors.CYAN}좋은 하루 되세요! 🌟{Colors.RESET}\n")
                break
                
            else:
                print(f"\n{Colors.RED}❌ 잘못된 선택입니다. 1-4 중에서 선택하세요.{Colors.RESET}")
                
        except KeyboardInterrupt:
            print(f"\n\n{Colors.YELLOW}👋 사용자에 의해 중단되었습니다.{Colors.RESET}")
            break
        except Exception as e:
            print(f"\n{Colors.RED}예상치 못한 오류 발생: {e}{Colors.RESET}")
            input(f"\n{Colors.CYAN}계속하려면 엔터를 누르세요...{Colors.RESET}")

if __name__ == "__main__":
    try:
        main_menu()
    except Exception as e:
        print(f"\n{Colors.RED}프로그램 오류: {e}{Colors.RESET}")
        sys.exit(1)