#!/usr/bin/env python3
"""
🚀 Netlify Ultra Deploy GUI - 원클릭 자동 배포 GUI 버전
"""

import tkinter as tk
from tkinter import ttk, scrolledtext
import subprocess
import threading
from datetime import datetime
import os
import webbrowser
import time
import platform

class DeployGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🚀 Netlify Ultra Deploy")
        self.root.geometry("900x700")
        self.root.configure(bg='#0a0a0a')
        
        # 다크모드 설정
        if platform.system() == "Darwin":  # macOS
            os.system("defaults write -g NSRequiresAquaSystemAppearance -bool No")
            self.root.update()
        
        # 창을 화면 중앙에 위치
        self.center_window()
        
        # 프로젝트 디렉토리
        self.project_dir = "/Users/iuo/Documents/EUOvaultSYNC/1 Project/privacy/crypto-price-monitor"
        
        # 스타일 설정
        self.setup_styles()
        
        # UI 구성
        self.create_widgets()
        
        # 초기 디렉토리 이동
        self.change_to_project_dir()
        
    def center_window(self):
        """창을 화면 중앙에 위치시킴"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
    def setup_styles(self):
        """스타일 설정"""
        style = ttk.Style()
        style.theme_use('default')
        
        # 다크 테마 색상 (더 나은 가독성)
        bg_color = '#0a0a0a'
        fg_color = '#ffffff'
        button_bg = '#1a1a1a'
        accent_color = '#00e676'  # 더 밝은 녹색
        hover_color = '#69f0ae'   # 호버시 색상
        danger_color = '#ff5252'
        
        # 버튼 스타일
        style.configure('Deploy.TButton',
                       background=accent_color,
                       foreground='white',
                       borderwidth=0,
                       focuscolor='none',
                       font=('SF Pro Display', 14, 'bold'))
        style.map('Deploy.TButton',
                 background=[('active', '#45a049')])
        
        style.configure('Secondary.TButton',
                       background=button_bg,
                       foreground=fg_color,
                       borderwidth=1,
                       relief='solid',
                       focuscolor='none',
                       font=('SF Pro Display', 12))
        style.map('Secondary.TButton',
                 background=[('active', '#2a2a2a')])
        
        # 레이블 스타일
        style.configure('Title.TLabel',
                       background=bg_color,
                       foreground=fg_color,
                       font=('SF Pro Display', 24, 'bold'))
        
        style.configure('Status.TLabel',
                       background=bg_color,
                       foreground='#888888',
                       font=('SF Pro Display', 11))
        
        # 프레임 스타일
        style.configure('Card.TFrame',
                       background='#1a1a1a',
                       relief='flat',
                       borderwidth=1)
        
    def create_widgets(self):
        """위젯 생성"""
        # 메인 컨테이너
        main_container = tk.Frame(self.root, bg='#0a0a0a')
        main_container.pack(fill='both', expand=True, padx=20, pady=20)
        
        # 헤더
        self.create_header(main_container)
        
        # 원클릭 배포 섹션
        self.create_deploy_section(main_container)
        
        # 로그 섹션
        self.create_log_section(main_container)
        
        # 하단 버튼들
        self.create_bottom_buttons(main_container)
        
    def create_header(self, parent):
        """헤더 생성"""
        header_frame = tk.Frame(parent, bg='#0a0a0a')
        header_frame.pack(fill='x', pady=(0, 20))
        
        # 타이틀
        title_label = ttk.Label(header_frame, text="🚀 NETLIFY ULTRA DEPLOY", style='Title.TLabel')
        title_label.pack()
        
        # 서브타이틀
        subtitle_label = ttk.Label(header_frame, text="원클릭 자동 배포 시스템 v2.0", style='Status.TLabel')
        subtitle_label.pack(pady=(5, 0))
        
    def create_deploy_section(self, parent):
        """원클릭 배포 섹션"""
        deploy_frame = ttk.Frame(parent, style='Card.TFrame')
        deploy_frame.pack(fill='x', pady=(0, 20))
        
        inner_frame = tk.Frame(deploy_frame, bg='#1a1a1a')
        inner_frame.pack(fill='both', expand=True, padx=20, pady=20)
        
        # 배포 버튼 (크고 눈에 띄게)
        self.deploy_button = tk.Button(
            inner_frame,
            text="🚀  원클릭 자동 배포",
            command=self.auto_deploy,
            bg='#00e676',
            fg='#000000',  # 검정색 텍스트로 가독성 향상
            font=('SF Pro Display', 20, 'bold'),
            bd=0,
            padx=50,
            pady=20,
            cursor='hand2',
            activebackground='#69f0ae',
            activeforeground='#000000',
            relief='flat',
            highlightthickness=0
        )
        self.deploy_button.pack(pady=20)
        
        # 버튼에 그림자 효과 추가
        shadow_frame = tk.Frame(inner_frame, bg='#000000', height=5)
        shadow_frame.pack(fill='x', pady=(0, 20))
        
        # 상태 표시
        self.status_label = ttk.Label(inner_frame, text="대기 중...", style='Status.TLabel')
        self.status_label.pack(pady=(10, 0))
        
        # 프로그레스 바
        self.progress = ttk.Progressbar(inner_frame, length=300, mode='indeterminate')
        self.progress.pack(pady=(10, 0))
        
    def create_log_section(self, parent):
        """로그 섹션"""
        log_frame = ttk.Frame(parent, style='Card.TFrame')
        log_frame.pack(fill='both', expand=True, pady=(0, 20))
        
        # 로그 제목
        log_title = tk.Label(log_frame, text="📋 실행 로그", bg='#1a1a1a', fg='#ffffff', 
                            font=('SF Pro Display', 14, 'bold'))
        log_title.pack(anchor='w', padx=20, pady=(15, 10))
        
        # 로그 텍스트 영역 (더 나은 가독성)
        self.log_text = scrolledtext.ScrolledText(
            log_frame,
            wrap='word',
            width=80,
            height=15,
            bg='#151515',  # 약간 밝은 배경
            fg='#e0e0e0',  # 밝은 회색 텍스트
            font=('SF Mono', 12),  # 더 큰 폰트
            insertbackground='#00ff00',
            bd=0,
            padx=10,
            pady=10
        )
        self.log_text.pack(fill='both', expand=True, padx=20, pady=(0, 20))
        
        # 태그 설정 (더 선명한 색상)
        self.log_text.tag_config('info', foreground='#64b5f6', font=('SF Mono', 12, 'bold'))
        self.log_text.tag_config('warning', foreground='#ffb74d', font=('SF Mono', 12, 'bold'))
        self.log_text.tag_config('error', foreground='#ef5350', font=('SF Mono', 12, 'bold'))
        self.log_text.tag_config('success', foreground='#81c784', font=('SF Mono', 12, 'bold'))
        self.log_text.tag_config('timestamp', foreground='#9e9e9e')
        
    def create_bottom_buttons(self, parent):
        """하단 버튼들"""
        button_frame = tk.Frame(parent, bg='#0a0a0a')
        button_frame.pack(fill='x')
        
        # 웹사이트 열기 버튼
        web_button = tk.Button(
            button_frame,
            text="🌐 웹사이트 열기",
            command=self.open_website,
            bg='#2979ff',
            fg='white',
            font=('SF Pro Display', 13, 'bold'),
            bd=0,
            padx=25,
            pady=10,
            cursor='hand2',
            activebackground='#448aff'
        )
        web_button.pack(side='left', padx=(0, 10))
        
        # 로그 지우기 버튼
        clear_button = tk.Button(
            button_frame,
            text="🧹 로그 지우기",
            command=self.clear_log,
            bg='#ff6f00',
            fg='white',
            font=('SF Pro Display', 13, 'bold'),
            bd=0,
            padx=25,
            pady=10,
            cursor='hand2',
            activebackground='#ffa000'
        )
        clear_button.pack(side='left', padx=(0, 10))
        
        # 종료 버튼
        exit_button = tk.Button(
            button_frame,
            text="🚪 종료",
            command=self.root.quit,
            bg='#424242',
            fg='white',
            font=('SF Pro Display', 13, 'bold'),
            bd=0,
            padx=25,
            pady=10,
            cursor='hand2',
            activebackground='#616161'
        )
        exit_button.pack(side='right')
        
    def log(self, message, tag='info'):
        """로그 메시지 추가"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.insert('end', f"[{timestamp}] ", 'timestamp')
        self.log_text.insert('end', f"{message}\n", tag)
        self.log_text.see('end')
        self.root.update()
        
    def clear_log(self):
        """로그 지우기"""
        self.log_text.delete('1.0', 'end')
        
    def update_status(self, message):
        """상태 업데이트"""
        self.status_label.config(text=message)
        self.root.update()
        
    def change_to_project_dir(self):
        """프로젝트 디렉토리로 이동"""
        try:
            os.chdir(self.project_dir)
            self.log(f"✓ 프로젝트 디렉토리 설정: {self.project_dir}", 'success')
        except Exception as e:
            self.log(f"❌ 디렉토리 이동 실패: {e}", 'error')
            
    def run_command(self, command):
        """명령어 실행"""
        try:
            result = subprocess.run(
                command,
                shell=True,
                check=True,
                capture_output=True,
                text=True
            )
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            return False, e.stderr
            
    def auto_deploy(self):
        """원클릭 자동 배포"""
        # 버튼 비활성화 (색상 변경)
        self.deploy_button.config(
            state='disabled', 
            text='🔄 배포 중...',
            bg='#757575',
            fg='#ffffff'
        )
        self.progress.start(10)
        
        # 별도 스레드에서 실행
        deploy_thread = threading.Thread(target=self._deploy_process)
        deploy_thread.daemon = True
        deploy_thread.start()
        
    def _deploy_process(self):
        """배포 프로세스"""
        try:
            # Git 상태 확인
            self.update_status("Git 상태 확인 중...")
            self.log("🔍 Git 상태 확인 중...", 'info')
            success, _ = self.run_command("git status")
            if not success:
                self.log("❌ Git 저장소가 아니거나 Git이 설치되지 않았습니다.", 'error')
                return
                
            # 변경사항 스테이징
            self.update_status("변경사항 스테이징 중...")
            self.log("📦 변경사항 스테이징 중...", 'info')
            time.sleep(0.5)
            success, _ = self.run_command("git add .")
            if not success:
                self.log("❌ 스테이징 실패", 'error')
                return
            self.log("✓ 스테이징 완료", 'success')
            
            # 커밋 생성
            now = datetime.now()
            commit_message = f"🚀 Auto Deploy: {now.strftime('%Y-%m-%d %H:%M:%S')}"
            self.update_status(f"커밋 생성 중: {commit_message}")
            self.log(f"💾 커밋 생성 중: {commit_message}", 'info')
            time.sleep(0.5)
            
            success, output = self.run_command(f'git commit -m "{commit_message}"')
            if not success:
                if "nothing to commit" in str(output):
                    self.log("ℹ️ 변경사항이 없습니다. 기존 커밋을 푸시합니다.", 'warning')
                    # 변경사항이 없어도 푸시는 계속 진행
                else:
                    self.log(f"❌ 커밋 실패: {output}", 'error')
                    return
            else:
                self.log("✓ 커밋 완료", 'success')
            
            # 푸시
            self.update_status("원격 저장소로 푸시 중...")
            self.log("📤 원격 저장소로 푸시 중...", 'info')
            time.sleep(0.5)
            
            success, _ = self.run_command("git push origin main")
            if not success:
                success, _ = self.run_command("git push origin master")
                if not success:
                    self.log("❌ 푸시 실패. 브랜치를 확인하세요.", 'error')
                    return
                    
            self.log("✓ 푸시 완료", 'success')
            self.log("🎉 배포 성공! 1-2분 후 사이트에 반영됩니다.", 'success')
            
            # 성공 알림
            self.update_status("✅ 배포 완료!")
            
            # 자동으로 웹사이트 열기
            self.root.after(1000, self.open_website)
            
        except Exception as e:
            self.log(f"❌ 예상치 못한 오류: {e}", 'error')
            
        finally:
            # UI 복원
            self.progress.stop()
            self.deploy_button.config(
                state='normal', 
                text='🚀  원클릭 자동 배포',
                bg='#00e676',
                fg='#000000'
            )
            
    def open_website(self):
        """웹사이트 열기"""
        url = "https://euo.netlify.app"
        self.log(f"🌐 웹사이트 열기: {url}", 'info')
        webbrowser.open(url)
        
    def run(self):
        """GUI 실행"""
        self.root.mainloop()

if __name__ == "__main__":
    app = DeployGUI()
    app.run()