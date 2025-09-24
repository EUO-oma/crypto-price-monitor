import tkinter as tk
from tkinter import ttk, messagebox
import win32gui
import win32con
import threading
import time

class ExactWindowHider:
    def __init__(self, root):
        self.root = root
        self.root.title("특정 창 이름 숨김 도구")
        self.root.geometry("400x300")
        
        # 숨긴 창들 저장 (hwnd: window_title)
        self.hidden_windows = {}
        
        # 찾을 창 이름 (정확히 일치)
        self.target_window_name = "네트워크에 연결"
        
        # GUI 구성
        self.setup_gui()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="창 이름 정확 일치 숨김", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 20))
        
        # 창 이름 입력
        input_frame = ttk.LabelFrame(main_frame, text="숨길 창 이름 (정확히 일치)", padding="10")
        input_frame.pack(fill=tk.X, pady=(0, 20))
        
        self.window_name_var = tk.StringVar(value=self.target_window_name)
        self.window_name_entry = ttk.Entry(input_frame, textvariable=self.window_name_var, 
                                          font=("Arial", 12), width=30)
        self.window_name_entry.pack(fill=tk.X)
        
        # 현재 상태
        status_frame = ttk.LabelFrame(main_frame, text="현재 상태", padding="10")
        status_frame.pack(fill=tk.BOTH, expand=True)
        
        self.status_text = tk.Text(status_frame, height=5, width=40, font=("Arial", 10))
        self.status_text.pack(fill=tk.BOTH, expand=True)
        
        # 버튼들
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(20, 0))
        
        # 큰 토글 버튼
        self.toggle_btn = tk.Button(
            button_frame,
            text="숨기기/보이기\n토글",
            command=self.toggle_windows,
            font=("Arial", 12, "bold"),
            width=12,
            height=2,
            bg="#2196F3",
            fg="white",
            activebackground="#1976D2",
            cursor="hand2"
        )
        self.toggle_btn.pack(side=tk.LEFT, padx=5)
        
        # 검색 버튼
        self.search_btn = ttk.Button(button_frame, text="창 검색", 
                                    command=self.search_windows)
        self.search_btn.pack(side=tk.LEFT, padx=5)
        
        # 새로고침 버튼
        self.refresh_btn = ttk.Button(button_frame, text="상태 새로고침", 
                                     command=self.update_status)
        self.refresh_btn.pack(side=tk.LEFT, padx=5)
        
        # 초기 상태 업데이트
        self.update_status()
        
        # 엔터키로 토글
        self.root.bind('<Return>', lambda e: self.toggle_windows())
        
    def find_exact_windows(self, window_name):
        """정확히 일치하는 이름의 창 찾기"""
        windows = []
        
        def enum_window_callback(hwnd, result):
            window_text = win32gui.GetWindowText(hwnd)
            # 정확히 일치하는 창만 찾기
            if window_text == window_name and win32gui.IsWindowVisible(hwnd):
                windows.append((hwnd, window_text))
            return True
        
        try:
            win32gui.EnumWindows(enum_window_callback, None)
        except:
            pass
        
        return windows
    
    def search_windows(self):
        """창 검색 및 표시"""
        window_name = self.window_name_var.get().strip()
        if not window_name:
            messagebox.showwarning("경고", "창 이름을 입력하세요.")
            return
        
        windows = self.find_exact_windows(window_name)
        
        self.status_text.delete(1.0, tk.END)
        self.status_text.insert(tk.END, f"🔍 '{window_name}' 검색 결과:\n\n")
        
        if windows:
            self.status_text.insert(tk.END, f"✅ {len(windows)}개 창 발견:\n")
            for hwnd, title in windows:
                status = " [숨김]" if hwnd in self.hidden_windows else " [표시]"
                self.status_text.insert(tk.END, f"  • {title}{status}\n")
        else:
            self.status_text.insert(tk.END, "❌ 일치하는 창을 찾을 수 없습니다.\n")
            self.status_text.insert(tk.END, "\n💡 팁: 창 이름이 정확한지 확인하세요.")
    
    def toggle_windows(self):
        """창 토글"""
        window_name = self.window_name_var.get().strip()
        if not window_name:
            messagebox.showwarning("경고", "창 이름을 입력하세요.")
            return
        
        # 현재 상태에 따라 동작 결정
        if self.hidden_windows:
            # 숨긴 창이 있으면 모두 보이기
            self.show_all_windows()
        else:
            # 숨긴 창이 없으면 숨기기
            self.hide_windows(window_name)
    
    def hide_windows(self, window_name):
        """창 숨기기"""
        windows = self.find_exact_windows(window_name)
        
        if not windows:
            messagebox.showinfo("알림", f"'{window_name}' 창을 찾을 수 없습니다.")
            self.toggle_btn.config(bg="#f44336")  # 빨간색
            self.root.after(2000, lambda: self.toggle_btn.config(bg="#2196F3"))
            return
        
        hidden_count = 0
        for hwnd, title in windows:
            try:
                win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                self.hidden_windows[hwnd] = title
                hidden_count += 1
            except:
                pass
        
        if hidden_count > 0:
            self.toggle_btn.config(text="다시 보이기", bg="#4CAF50")  # 초록색
            messagebox.showinfo("완료", f"{hidden_count}개의 창을 숨겼습니다.")
        
        self.update_status()
    
    def show_all_windows(self):
        """모든 창 보이기"""
        shown_count = 0
        for hwnd in list(self.hidden_windows.keys()):
            try:
                win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                del self.hidden_windows[hwnd]
                shown_count += 1
            except:
                # 창이 닫혔을 수 있음
                del self.hidden_windows[hwnd]
        
        self.toggle_btn.config(text="숨기기/보이기\n토글", bg="#2196F3")
        
        if shown_count > 0:
            messagebox.showinfo("완료", f"{shown_count}개의 창을 복원했습니다.")
        
        self.update_status()
    
    def update_status(self):
        """상태 업데이트"""
        self.status_text.delete(1.0, tk.END)
        
        # 현재 숨긴 창
        if self.hidden_windows:
            self.status_text.insert(tk.END, "🔒 숨긴 창:\n")
            for hwnd, title in self.hidden_windows.items():
                self.status_text.insert(tk.END, f"  • {title}\n")
            self.status_text.insert(tk.END, f"\n총 {len(self.hidden_windows)}개 숨김")
        else:
            self.status_text.insert(tk.END, "현재 숨긴 창이 없습니다.\n")
            self.status_text.insert(tk.END, "\n창 이름을 입력하고 토글 버튼을 누르세요.")

def main():
    # Windows 체크
    import platform
    if platform.system() != 'Windows':
        print("이 프로그램은 Windows에서만 실행됩니다.")
        return
    
    try:
        import win32gui
        import win32con
    except ImportError:
        print("pywin32가 필요합니다: pip install pywin32")
        return
    
    root = tk.Tk()
    app = ExactWindowHider(root)
    root.mainloop()

if __name__ == "__main__":
    main()