import tkinter as tk
from tkinter import ttk, messagebox
import win32gui
import win32con
import threading
import time

class SimpleNetworkWindowHider:
    def __init__(self, root):
        self.root = root
        self.root.title("네트워크 연결 창 토글")
        self.root.geometry("350x250")
        
        # 숨긴 창 추적 (hwnd: original_show_state)
        self.hidden_windows = {}
        
        # GUI 구성
        self.setup_gui()
        
        # 키보드 단축키 설정
        self.root.bind('<F1>', lambda e: self.toggle_network_windows())
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="네트워크 연결 창 숨김", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 20))
        
        # 설명
        desc_label = ttk.Label(main_frame, 
                              text="브라우저의 '네트워크 연결' 창을\n토글로 숨기고 보이기",
                              justify=tk.CENTER)
        desc_label.pack(pady=(0, 20))
        
        # 큰 토글 버튼
        self.toggle_btn = tk.Button(
            main_frame, 
            text="숨기기/보이기\n토글",
            command=self.toggle_network_windows,
            font=("Arial", 14),
            width=15,
            height=3,
            bg="#4CAF50",
            fg="white",
            activebackground="#45a049",
            cursor="hand2"
        )
        self.toggle_btn.pack(pady=10)
        
        # 단축키 안내
        shortcut_label = ttk.Label(main_frame, 
                                  text="단축키: F1",
                                  foreground="gray")
        shortcut_label.pack()
        
        # 상태 표시
        self.status_label = ttk.Label(main_frame, text="대기 중", 
                                     font=("Arial", 10))
        self.status_label.pack(pady=(20, 0))
        
        # 창 닫기 이벤트
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def find_network_windows(self):
        """네트워크 연결 창 찾기"""
        windows = []
        
        def enum_window_callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                window_text = win32gui.GetWindowText(hwnd)
                # 정확히 "네트워크 연결" 제목인 창
                if window_text == "네트워크 연결" or \
                   window_text.lower() == "network connection" or \
                   window_text == "Network Connection":
                    windows.append(hwnd)
            return True
        
        try:
            win32gui.EnumWindows(enum_window_callback, windows)
        except:
            pass
        return windows
    
    def toggle_network_windows(self):
        """네트워크 연결 창 토글"""
        # 현재 네트워크 창 찾기
        network_windows = self.find_network_windows()
        
        if not network_windows and not self.hidden_windows:
            self.status_label.config(text="❌ 네트워크 연결 창을 찾을 수 없습니다")
            self.toggle_btn.config(bg="#f44336")
            self.root.after(2000, lambda: self.toggle_btn.config(bg="#4CAF50"))
            return
        
        # 숨긴 창이 있으면 모두 보이기
        if self.hidden_windows:
            shown_count = 0
            for hwnd in list(self.hidden_windows.keys()):
                try:
                    win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                    del self.hidden_windows[hwnd]
                    shown_count += 1
                except:
                    # 창이 닫혔을 수 있음
                    del self.hidden_windows[hwnd]
            
            self.status_label.config(text=f"✅ {shown_count}개 창을 표시했습니다")
            self.toggle_btn.config(text="숨기기/보이기\n토글", bg="#4CAF50")
        else:
            # 보이는 창들을 숨기기
            hidden_count = 0
            for hwnd in network_windows:
                try:
                    win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                    self.hidden_windows[hwnd] = True
                    hidden_count += 1
                except:
                    pass
            
            if hidden_count > 0:
                self.status_label.config(text=f"🔒 {hidden_count}개 창을 숨겼습니다")
                self.toggle_btn.config(text="다시 보이기", bg="#2196F3")
            else:
                self.status_label.config(text="❌ 창을 숨길 수 없습니다")
    
    def on_closing(self):
        """프로그램 종료"""
        # 숨긴 창 복원
        if self.hidden_windows:
            for hwnd in list(self.hidden_windows.keys()):
                try:
                    win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                except:
                    pass
        
        self.root.destroy()

def main():
    # Windows 체크
    import platform
    if platform.system() != 'Windows':
        print("이 프로그램은 Windows에서만 실행됩니다.")
        return
    
    # 필요한 패키지 체크
    try:
        import win32gui
        import win32con
    except ImportError:
        print("pywin32 패키지가 필요합니다.")
        print("설치: pip install pywin32")
        return
    
    root = tk.Tk()
    app = SimpleNetworkWindowHider(root)
    root.mainloop()

if __name__ == "__main__":
    main()