#!/usr/bin/env python3
"""
Crypto Price Monitor - GUI 배포 도구
Git 커밋과 Netlify 배포를 GUI로 쉽게 관리
"""

import tkinter as tk
from tkinter import ttk, scrolledtext, messagebox
import subprocess
import threading
import os
from datetime import datetime

class DeployGUI:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("🚀 Crypto Monitor - Deploy Tool")
        self.root.geometry("800x600")
        self.root.resizable(True, True)
        
        # 프로젝트 경로
        self.project_dir = "/Users/iuo/Documents/EUOvaultSYNC/1 Project/privacy/crypto-price-monitor"
        self.site_url = "https://euo.netlify.app"
        
        # 다크 테마 스타일 설정
        self.setup_dark_theme()
        
        # GUI 구성
        self.setup_gui()
        
        # 초기 상태 확인
        self.check_git_status()
        
    def setup_dark_theme(self):
        """다크 테마 스타일 설정"""
        style = ttk.Style()
        
        # 다크 색상 팔레트
        bg_color = "#1e1e1e"
        fg_color = "#ffffff"
        button_bg = "#0d7377"
        button_hover = "#14ffec"
        
        self.root.configure(bg=bg_color)
        
        style.configure("Title.TLabel", 
                       background=bg_color, 
                       foreground=fg_color, 
                       font=("Arial", 20, "bold"))
        
        style.configure("Info.TLabel", 
                       background=bg_color, 
                       foreground="#aaaaaa", 
                       font=("Arial", 10))
        
        style.configure("Deploy.TButton",
                       font=("Arial", 14, "bold"))
        
    def setup_gui(self):
        """GUI 레이아웃 구성"""
        # 메인 프레임
        main_frame = tk.Frame(self.root, bg="#1e1e1e")
        main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # 타이틀
        title_frame = tk.Frame(main_frame, bg="#1e1e1e")
        title_frame.pack(fill=tk.X, pady=(0, 20))
        
        title_label = ttk.Label(title_frame, text="🚀 Crypto Monitor Deploy", style="Title.TLabel")
        title_label.pack(side=tk.LEFT)
        
        # 프로젝트 정보
        info_label = ttk.Label(title_frame, 
                              text=f"📁 {self.project_dir}\n🌐 {self.site_url}", 
                              style="Info.TLabel")
        info_label.pack(side=tk.RIGHT)
        
        # Git 상태 표시
        status_frame = tk.LabelFrame(main_frame, 
                                   text="📊 Git Status", 
                                   bg="#2a2a2a", 
                                   fg="#ffffff",
                                   font=("Arial", 12, "bold"))
        status_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 20))
        
        self.status_text = scrolledtext.ScrolledText(status_frame, 
                                                    height=10, 
                                                    bg="#000000", 
                                                    fg="#00ff00",
                                                    font=("Consolas", 10),
                                                    wrap=tk.WORD)
        self.status_text.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # 커밋 메시지 입력
        commit_frame = tk.LabelFrame(main_frame, 
                                   text="✏️ Commit Message", 
                                   bg="#2a2a2a", 
                                   fg="#ffffff",
                                   font=("Arial", 12, "bold"))
        commit_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.commit_entry = tk.Entry(commit_frame, 
                                    bg="#000000", 
                                    fg="#ffffff", 
                                    font=("Arial", 12),
                                    insertbackground="white")
        self.commit_entry.pack(fill=tk.X, padx=10, pady=10)
        self.commit_entry.insert(0, f"Update: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        
        # 버튼 프레임
        button_frame = tk.Frame(main_frame, bg="#1e1e1e")
        button_frame.pack(fill=tk.X)
        
        # 새로고침 버튼
        self.refresh_btn = tk.Button(button_frame, 
                                   text="🔄 Refresh Status",
                                   bg="#444444",
                                   fg="#ffffff",
                                   font=("Arial", 12),
                                   command=self.check_git_status,
                                   relief=tk.FLAT,
                                   padx=20,
                                   pady=10)
        self.refresh_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        # 배포 버튼
        self.deploy_btn = tk.Button(button_frame, 
                                  text="🚀 Deploy to Netlify",
                                  bg="#0d7377",
                                  fg="#ffffff",
                                  font=("Arial", 14, "bold"),
                                  command=self.deploy,
                                  relief=tk.FLAT,
                                  padx=30,
                                  pady=15)
        self.deploy_btn.pack(side=tk.LEFT)
        
        # 사이트 열기 버튼
        self.open_btn = tk.Button(button_frame, 
                                text="🌐 Open Site",
                                bg="#14ffec",
                                fg="#000000",
                                font=("Arial", 12),
                                command=self.open_site,
                                relief=tk.FLAT,
                                padx=20,
                                pady=10)
        self.open_btn.pack(side=tk.RIGHT)
        
        # 진행 상태 표시
        self.progress_label = tk.Label(main_frame, 
                                     text="", 
                                     bg="#1e1e1e", 
                                     fg="#14ffec",
                                     font=("Arial", 10))
        self.progress_label.pack(fill=tk.X, pady=(10, 0))
        
        # 버튼 호버 효과
        self.add_hover_effect(self.refresh_btn, "#444444", "#666666")
        self.add_hover_effect(self.deploy_btn, "#0d7377", "#14ffec", fg_hover="#000000")
        self.add_hover_effect(self.open_btn, "#14ffec", "#0d7377", fg_normal="#000000", fg_hover="#ffffff")
        
    def add_hover_effect(self, button, bg_normal, bg_hover, fg_normal="#ffffff", fg_hover="#ffffff"):
        """버튼 호버 효과 추가"""
        def on_enter(e):
            button.config(bg=bg_hover, fg=fg_hover)
            
        def on_leave(e):
            button.config(bg=bg_normal, fg=fg_normal)
            
        button.bind("<Enter>", on_enter)
        button.bind("<Leave>", on_leave)
        
    def run_command(self, command):
        """명령어 실행 및 결과 반환"""
        try:
            os.chdir(self.project_dir)
            result = subprocess.run(command, 
                                  shell=True, 
                                  check=True, 
                                  capture_output=True, 
                                  text=True)
            return True, result.stdout or "명령이 성공적으로 실행되었습니다."
        except subprocess.CalledProcessError as e:
            return False, f"❌ 에러: {e.stderr or str(e)}"
        except Exception as e:
            return False, f"❌ 예상치 못한 오류: {str(e)}"
    
    def check_git_status(self):
        """Git 상태 확인"""
        self.status_text.delete('1.0', tk.END)
        self.progress_label.config(text="📊 Git 상태 확인 중...")
        
        def check():
            # git status
            success, output = self.run_command("git status --short")
            if success:
                if not output.strip():
                    self.status_text.insert(tk.END, "✅ 변경사항이 없습니다.\n\n")
                    self.deploy_btn.config(state=tk.DISABLED)
                else:
                    self.status_text.insert(tk.END, "📝 변경된 파일:\n")
                    self.status_text.insert(tk.END, output + "\n\n")
                    self.deploy_btn.config(state=tk.NORMAL)
                
                # git diff --stat
                success, diff_output = self.run_command("git diff --stat")
                if success and diff_output.strip():
                    self.status_text.insert(tk.END, "📊 변경 통계:\n")
                    self.status_text.insert(tk.END, diff_output)
            else:
                self.status_text.insert(tk.END, output)
                
            self.progress_label.config(text="")
            
        # 별도 스레드에서 실행
        threading.Thread(target=check, daemon=True).start()
        
    def deploy(self):
        """배포 실행"""
        commit_msg = self.commit_entry.get().strip()
        if not commit_msg:
            messagebox.showwarning("경고", "커밋 메시지를 입력해주세요.")
            return
            
        # 확인 대화상자
        if not messagebox.askyesno("배포 확인", 
                                  f"다음 메시지로 배포하시겠습니까?\n\n{commit_msg}"):
            return
            
        self.deploy_btn.config(state=tk.DISABLED)
        self.refresh_btn.config(state=tk.DISABLED)
        self.status_text.delete('1.0', tk.END)
        
        def deploy_thread():
            commands = [
                ("git add .", "📦 변경사항 스테이징..."),
                (f'git commit -m "{commit_msg}"', "💾 커밋 생성..."),
                ("git push origin main", "📤 원격 저장소로 푸시...")
            ]
            
            all_success = True
            
            for cmd, desc in commands:
                self.progress_label.config(text=desc)
                self.status_text.insert(tk.END, f"\n{desc}\n")
                self.status_text.see(tk.END)
                self.root.update()
                
                success, output = self.run_command(cmd)
                
                if success:
                    self.status_text.insert(tk.END, f"✅ {output}\n")
                else:
                    # main 브랜치 실패시 master 시도
                    if "main" in cmd and "push" in cmd:
                        self.status_text.insert(tk.END, "main 브랜치 실패, master 브랜치 시도...\n")
                        success, output = self.run_command("git push origin master")
                        
                    if not success:
                        self.status_text.insert(tk.END, output + "\n")
                        all_success = False
                        break
                        
                self.status_text.see(tk.END)
                
            if all_success:
                self.progress_label.config(text="✅ 배포 완료! 1-2분 후 사이트에서 확인하세요.")
                self.status_text.insert(tk.END, "\n" + "="*50 + "\n")
                self.status_text.insert(tk.END, "✅ 배포가 성공적으로 완료되었습니다!\n")
                self.status_text.insert(tk.END, f"🌐 {self.site_url}\n")
                self.status_text.insert(tk.END, "="*50 + "\n")
                
                # 새 커밋 메시지 준비
                self.commit_entry.delete(0, tk.END)
                self.commit_entry.insert(0, f"Update: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
            else:
                self.progress_label.config(text="❌ 배포 실패")
                messagebox.showerror("배포 실패", "배포 중 오류가 발생했습니다.\n로그를 확인해주세요.")
                
            self.deploy_btn.config(state=tk.NORMAL)
            self.refresh_btn.config(state=tk.NORMAL)
            
            # 상태 새로고침
            self.check_git_status()
            
        threading.Thread(target=deploy_thread, daemon=True).start()
        
    def open_site(self):
        """사이트 열기"""
        subprocess.run(f"open {self.site_url}", shell=True)
        
    def run(self):
        """GUI 실행"""
        self.root.mainloop()

if __name__ == "__main__":
    app = DeployGUI()
    app.run()