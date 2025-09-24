import tkinter as tk
from tkinter import ttk, messagebox
import threading
import time
import random

class WindowHiderDemo:
    def __init__(self, root):
        self.root = root
        self.root.title("네트워크 연결 자동 숨김 (데모)")
        self.root.geometry("450x400")
        
        # 데모용 가상 창들
        self.demo_windows = []
        self.hidden_windows = []
        self.auto_hide_enabled = False
        
        # GUI 구성
        self.setup_gui()
        
        # 데모 창 생성
        self.create_demo_windows()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="네트워크 창 자동 숨김 도구 (데모)", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 10))
        
        # 경고 메시지
        warning_label = ttk.Label(main_frame, 
                                 text="⚠️ 데모 버전 - Windows에서만 실제 작동",
                                 foreground="red")
        warning_label.pack()
        
        # 자동 숨김 토글
        toggle_frame = ttk.LabelFrame(main_frame, text="자동 숨김 설정", padding="10")
        toggle_frame.pack(fill=tk.X, pady=(10, 10))
        
        self.auto_hide_var = tk.BooleanVar()
        self.auto_hide_check = ttk.Checkbutton(
            toggle_frame, 
            text="네트워크 연결 창 자동 숨김 활성화",
            variable=self.auto_hide_var,
            command=self.toggle_auto_hide
        )
        self.auto_hide_check.pack()
        
        # 감지 키워드 설정
        keyword_frame = ttk.LabelFrame(main_frame, text="감지 키워드", padding="10")
        keyword_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.keywords_text = tk.Text(keyword_frame, height=3, width=50)
        self.keywords_text.pack(fill=tk.X)
        self.keywords_text.insert(1.0, "네트워크 연결\nNetwork Connections\n네트워크 및 공유")
        
        # 현재 상태
        status_frame = ttk.LabelFrame(main_frame, text="현재 상태", padding="10")
        status_frame.pack(fill=tk.BOTH, expand=True)
        
        # 상태 표시
        self.status_text = tk.Text(status_frame, height=8, width=50)
        self.status_text.pack(fill=tk.BOTH, expand=True)
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(button_frame, text="데모 창 생성", 
                  command=self.create_demo_window).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="모두 보이기", 
                  command=self.show_all_windows).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="새로고침", 
                  command=self.update_status).pack(side=tk.LEFT, padx=5)
        
        # 상태바
        self.status_label = ttk.Label(self.root, text="데모 모드", relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM)
        
    def create_demo_windows(self):
        """데모용 가상 창 목록 생성"""
        self.demo_windows = [
            {"id": 1, "title": "네트워크 연결", "visible": True},
            {"id": 2, "title": "Network and Sharing Center", "visible": True},
            {"id": 3, "title": "일반 창 (숨기지 않음)", "visible": True}
        ]
        self.update_status()
        
    def create_demo_window(self):
        """새 데모 창 추가"""
        window_id = len(self.demo_windows) + 1
        titles = ["네트워크 연결", "Network Connections", "네트워크 및 공유 센터"]
        new_window = {
            "id": window_id,
            "title": random.choice(titles) + f" #{window_id}",
            "visible": True
        }
        self.demo_windows.append(new_window)
        
        # 자동 숨김이 켜져 있으면 바로 숨김
        if self.auto_hide_enabled and self.is_network_window(new_window["title"]):
            self.hide_window(new_window)
        
        self.update_status()
        
    def is_network_window(self, title):
        """네트워크 관련 창인지 확인"""
        keywords = self.keywords_text.get(1.0, tk.END).strip().split('\n')
        keywords = [k.strip().lower() for k in keywords if k.strip()]
        return any(keyword in title.lower() for keyword in keywords)
        
    def hide_window(self, window):
        """창 숨기기"""
        window["visible"] = False
        if window not in self.hidden_windows:
            self.hidden_windows.append(window)
            
    def show_window(self, window):
        """창 보이기"""
        window["visible"] = True
        if window in self.hidden_windows:
            self.hidden_windows.remove(window)
            
    def toggle_auto_hide(self):
        """자동 숨김 토글"""
        self.auto_hide_enabled = self.auto_hide_var.get()
        
        if self.auto_hide_enabled:
            self.start_monitoring()
            self.status_label.config(text="자동 숨김 활성화됨 (데모)")
            messagebox.showinfo("알림", "자동 숨김이 활성화되었습니다.\n새로운 네트워크 창이 열리면 자동으로 숨깁니다.")
        else:
            self.status_label.config(text="자동 숨김 비활성화됨 (데모)")
            
    def start_monitoring(self):
        """모니터링 시작 (데모)"""
        def monitor():
            while self.auto_hide_enabled:
                for window in self.demo_windows:
                    if window["visible"] and self.is_network_window(window["title"]):
                        self.hide_window(window)
                        self.root.after(0, self.update_status)
                time.sleep(1)
                
        thread = threading.Thread(target=monitor, daemon=True)
        thread.start()
        
    def show_all_windows(self):
        """모든 숨긴 창 보이기"""
        count = len(self.hidden_windows)
        for window in list(self.hidden_windows):
            self.show_window(window)
        self.update_status()
        if count > 0:
            messagebox.showinfo("완료", f"{count}개의 창을 복원했습니다.")
        else:
            messagebox.showinfo("정보", "숨겨진 창이 없습니다.")
            
    def update_status(self):
        """상태 업데이트"""
        self.status_text.delete(1.0, tk.END)
        
        # 숨겨진 창
        self.status_text.insert(tk.END, "🔒 숨겨진 창:\n")
        if self.hidden_windows:
            for window in self.hidden_windows:
                self.status_text.insert(tk.END, f"  • {window['title']}\n")
        else:
            self.status_text.insert(tk.END, "  (없음)\n")
            
        # 보이는 창
        self.status_text.insert(tk.END, "\n👁️ 보이는 창:\n")
        visible_windows = [w for w in self.demo_windows if w["visible"]]
        if visible_windows:
            for window in visible_windows:
                icon = "🌐 " if self.is_network_window(window["title"]) else ""
                self.status_text.insert(tk.END, f"  • {icon}{window['title']}\n")
        else:
            self.status_text.insert(tk.END, "  (없음)\n")
            
        # 상태바 업데이트
        mode = "자동 숨김 ON" if self.auto_hide_enabled else "자동 숨김 OFF"
        self.status_label.config(text=f"데모 모드 | {mode} | 숨긴 창: {len(self.hidden_windows)}개")

def main():
    root = tk.Tk()
    app = WindowHiderDemo(root)
    root.mainloop()

if __name__ == "__main__":
    main()