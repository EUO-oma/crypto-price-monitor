import tkinter as tk
from tkinter import ttk, messagebox
import win32gui
import win32con
import threading
import time
import sys

class AutoWindowHider:
    def __init__(self, root):
        self.root = root
        self.root.title("네트워크 연결 자동 숨김")
        self.root.geometry("450x350")
        
        # 숨긴 창들의 핸들을 저장
        self.hidden_windows = {}
        self.auto_hide_enabled = False
        self.monitoring_thread = None
        
        # GUI 구성
        self.setup_gui()
        
        # 초기 창 목록 업데이트
        self.update_window_list()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="네트워크 창 자동 숨김 도구", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 15))
        
        # 자동 숨김 토글
        toggle_frame = ttk.LabelFrame(main_frame, text="자동 숨김 설정", padding="10")
        toggle_frame.pack(fill=tk.X, pady=(0, 10))
        
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
        
        # 숨긴 창 목록
        self.status_text = tk.Text(status_frame, height=5, width=50)
        self.status_text.pack(fill=tk.BOTH, expand=True)
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        ttk.Button(button_frame, text="모두 보이기", command=self.show_all_windows).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="새로고침", command=self.update_window_list).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="종료", command=self.on_closing).pack(side=tk.RIGHT, padx=5)
        
        # 상태바
        self.status_label = ttk.Label(self.root, text="준비됨", relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM)
        
        # 창 닫기 이벤트
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def get_keywords(self):
        """키워드 목록 가져오기"""
        keywords = self.keywords_text.get(1.0, tk.END).strip().split('\n')
        return [k.strip().lower() for k in keywords if k.strip()]
    
    def find_network_windows(self):
        """네트워크 연결 관련 창 찾기"""
        windows = []
        keywords = self.get_keywords()
        
        def enum_window_callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                window_text = win32gui.GetWindowText(hwnd)
                if window_text and any(keyword in window_text.lower() for keyword in keywords):
                    class_name = win32gui.GetClassName(hwnd)
                    windows.append((hwnd, window_text, class_name))
            return True
        
        try:
            win32gui.EnumWindows(enum_window_callback, windows)
        except:
            pass
        return windows
    
    def update_window_list(self):
        """현재 상태 업데이트"""
        self.status_text.delete(1.0, tk.END)
        
        # 현재 숨겨진 창 표시
        if self.hidden_windows:
            self.status_text.insert(tk.END, "숨겨진 창:\n")
            for hwnd, (title, _) in self.hidden_windows.items():
                self.status_text.insert(tk.END, f"  • {title}\n")
        else:
            self.status_text.insert(tk.END, "숨겨진 창이 없습니다.\n")
        
        # 현재 보이는 네트워크 창
        visible_windows = self.find_network_windows()
        if visible_windows:
            self.status_text.insert(tk.END, "\n현재 보이는 네트워크 창:\n")
            for hwnd, title, _ in visible_windows:
                if hwnd not in self.hidden_windows:
                    self.status_text.insert(tk.END, f"  • {title}\n")
        
        status_msg = f"자동 숨김: {'활성' if self.auto_hide_enabled else '비활성'} | "
        status_msg += f"숨긴 창: {len(self.hidden_windows)}개"
        self.status_label.config(text=status_msg)
    
    def toggle_auto_hide(self):
        """자동 숨김 토글"""
        self.auto_hide_enabled = self.auto_hide_var.get()
        
        if self.auto_hide_enabled:
            self.start_monitoring()
            self.status_label.config(text="자동 숨김 시작됨")
        else:
            self.stop_monitoring()
            self.status_label.config(text="자동 숨김 중지됨")
    
    def start_monitoring(self):
        """모니터링 시작"""
        if self.monitoring_thread is None or not self.monitoring_thread.is_alive():
            self.monitoring_thread = threading.Thread(target=self.monitor_windows, daemon=True)
            self.monitoring_thread.start()
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.auto_hide_enabled = False
    
    def monitor_windows(self):
        """백그라운드에서 창 모니터링"""
        while self.auto_hide_enabled:
            try:
                windows = self.find_network_windows()
                for hwnd, title, class_name in windows:
                    if hwnd not in self.hidden_windows:
                        try:
                            win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                            self.hidden_windows[hwnd] = (title, class_name)
                            # GUI 업데이트
                            self.root.after(0, self.update_window_list)
                        except:
                            pass
            except:
                pass
            
            time.sleep(1)  # 1초마다 체크
    
    def show_all_windows(self):
        """모든 숨긴 창 보이기"""
        if not self.hidden_windows:
            messagebox.showinfo("정보", "숨겨진 창이 없습니다.")
            return
        
        shown_count = 0
        for hwnd in list(self.hidden_windows.keys()):
            try:
                win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                del self.hidden_windows[hwnd]
                shown_count += 1
            except:
                # 창이 이미 닫혔을 수 있음
                del self.hidden_windows[hwnd]
        
        self.update_window_list()
        messagebox.showinfo("완료", f"{shown_count}개의 창을 복원했습니다.")
    
    def on_closing(self):
        """프로그램 종료 시"""
        # 자동 숨김 중지
        self.auto_hide_enabled = False
        
        # 모든 창 복원
        if self.hidden_windows:
            result = messagebox.askyesno("종료", "숨겨진 창들을 복원하고 종료하시겠습니까?")
            if result:
                self.show_all_windows()
        
        self.root.destroy()
        sys.exit()

def main():
    # Windows 전용 체크
    import platform
    if platform.system() != 'Windows':
        messagebox.showerror("오류", "이 프로그램은 Windows에서만 실행됩니다.")
        return
    
    # 필요한 권한 체크
    try:
        import win32gui
        import win32con
    except ImportError:
        messagebox.showerror("오류", "pywin32 패키지가 필요합니다.\n\npip install pywin32")
        return
    
    root = tk.Tk()
    app = AutoWindowHider(root)
    
    # 시스템 트레이 옵션 (선택사항)
    root.iconify()  # 시작시 최소화
    root.deiconify()  # 다시 보이기
    
    root.mainloop()

if __name__ == "__main__":
    main()