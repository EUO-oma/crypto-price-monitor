import tkinter as tk
from tkinter import ttk, messagebox
import win32gui
import win32con
import win32api
import threading
import time

class WindowHider:
    def __init__(self, root):
        self.root = root
        self.root.title("네트워크 연결 숨김 도구")
        self.root.geometry("400x300")
        
        # 숨긴 창들의 핸들을 저장
        self.hidden_windows = {}
        
        # GUI 구성
        self.setup_gui()
        
        # 주기적으로 창 목록 업데이트
        self.update_window_list()
        
    def setup_gui(self):
        # 상단 프레임
        top_frame = ttk.Frame(self.root, padding="10")
        top_frame.pack(fill=tk.X)
        
        ttk.Label(top_frame, text="네트워크 연결 창 관리", font=("Arial", 14, "bold")).pack()
        
        # 중간 프레임 - 창 목록
        middle_frame = ttk.Frame(self.root, padding="10")
        middle_frame.pack(fill=tk.BOTH, expand=True)
        
        # 창 목록 레이블
        ttk.Label(middle_frame, text="발견된 네트워크 연결 창:").pack(anchor=tk.W)
        
        # 창 목록 표시
        self.window_listbox = tk.Listbox(middle_frame, height=6)
        self.window_listbox.pack(fill=tk.BOTH, expand=True, pady=(5, 0))
        
        # 스크롤바
        scrollbar = ttk.Scrollbar(self.window_listbox)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.window_listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.window_listbox.yview)
        
        # 하단 프레임 - 버튼들
        bottom_frame = ttk.Frame(self.root, padding="10")
        bottom_frame.pack(fill=tk.X)
        
        # 버튼들
        self.hide_btn = ttk.Button(bottom_frame, text="선택 창 숨기기", command=self.hide_selected_window)
        self.hide_btn.pack(side=tk.LEFT, padx=5)
        
        self.show_btn = ttk.Button(bottom_frame, text="모두 보이기", command=self.show_all_windows)
        self.show_btn.pack(side=tk.LEFT, padx=5)
        
        self.refresh_btn = ttk.Button(bottom_frame, text="새로고침", command=self.update_window_list)
        self.refresh_btn.pack(side=tk.LEFT, padx=5)
        
        # 상태 표시
        self.status_label = ttk.Label(self.root, text="준비됨", relief=tk.SUNKEN)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM)
        
    def find_network_windows(self):
        """네트워크 연결 관련 창 찾기"""
        windows = []
        
        def enum_window_callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                window_text = win32gui.GetWindowText(hwnd)
                # 네트워크 연결 관련 창 찾기
                if any(keyword in window_text.lower() for keyword in ['네트워크 연결', 'network connections', 'network and sharing', '네트워크 및 공유']):
                    class_name = win32gui.GetClassName(hwnd)
                    windows.append((hwnd, window_text, class_name))
            return True
        
        win32gui.EnumWindows(enum_window_callback, windows)
        return windows
    
    def update_window_list(self):
        """창 목록 업데이트"""
        self.window_listbox.delete(0, tk.END)
        windows = self.find_network_windows()
        
        if windows:
            for hwnd, title, class_name in windows:
                status = " [숨김]" if hwnd in self.hidden_windows else ""
                self.window_listbox.insert(tk.END, f"{title} ({class_name}){status}")
            self.status_label.config(text=f"{len(windows)}개의 네트워크 창 발견")
        else:
            self.window_listbox.insert(tk.END, "네트워크 연결 창을 찾을 수 없습니다")
            self.status_label.config(text="네트워크 창 없음")
        
        # 현재 창 핸들 저장
        self.current_windows = windows
    
    def hide_selected_window(self):
        """선택된 창 숨기기"""
        selection = self.window_listbox.curselection()
        if not selection:
            messagebox.showwarning("선택 없음", "숨길 창을 선택하세요.")
            return
        
        index = selection[0]
        if index < len(self.current_windows):
            hwnd, title, class_name = self.current_windows[index]
            
            try:
                # 창 숨기기
                win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                self.hidden_windows[hwnd] = (title, class_name)
                self.status_label.config(text=f"'{title}' 창을 숨겼습니다")
                self.update_window_list()
            except Exception as e:
                messagebox.showerror("오류", f"창을 숨기는 중 오류 발생: {str(e)}")
    
    def show_all_windows(self):
        """모든 숨긴 창 보이기"""
        if not self.hidden_windows:
            messagebox.showinfo("정보", "숨겨진 창이 없습니다.")
            return
        
        shown_count = 0
        for hwnd, (title, class_name) in list(self.hidden_windows.items()):
            try:
                win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                del self.hidden_windows[hwnd]
                shown_count += 1
            except:
                # 창이 이미 닫혔을 수 있음
                del self.hidden_windows[hwnd]
        
        self.status_label.config(text=f"{shown_count}개의 창을 복원했습니다")
        self.update_window_list()
    
    def auto_hide_network_windows(self):
        """자동으로 네트워크 창 숨기기 (백그라운드 스레드)"""
        def hide_loop():
            while True:
                windows = self.find_network_windows()
                for hwnd, title, class_name in windows:
                    if hwnd not in self.hidden_windows:
                        try:
                            win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                            self.hidden_windows[hwnd] = (title, class_name)
                        except:
                            pass
                time.sleep(5)  # 5초마다 체크
        
        # 백그라운드 스레드로 실행
        thread = threading.Thread(target=hide_loop, daemon=True)
        thread.start()

def main():
    # Windows 전용 체크
    import platform
    if platform.system() != 'Windows':
        print("이 프로그램은 Windows에서만 실행됩니다.")
        return
    
    root = tk.Tk()
    app = WindowHider(root)
    root.mainloop()

if __name__ == "__main__":
    main()