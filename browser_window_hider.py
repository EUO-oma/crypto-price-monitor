import tkinter as tk
from tkinter import ttk, messagebox
import win32gui
import win32con
import win32process
import threading
import time
import psutil

class BrowserWindowHider:
    def __init__(self, root):
        self.root = root
        self.root.title("브라우저 네트워크 연결 창 숨김")
        self.root.geometry("500x400")
        
        # 창 상태를 저장 (hwnd: is_hidden)
        self.window_states = {}
        self.monitoring_thread = None
        self.is_monitoring = False
        
        # GUI 구성
        self.setup_gui()
        
        # 초기 창 목록 업데이트
        self.refresh_window_list()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="브라우저 '네트워크 연결' 창 관리", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 10))
        
        # 설명
        desc_label = ttk.Label(main_frame, 
                              text="브라우저에서 '네트워크 연결' 제목의 창을 숨기기/보이기",
                              foreground="gray")
        desc_label.pack(pady=(0, 10))
        
        # 창 목록 프레임
        list_frame = ttk.LabelFrame(main_frame, text="발견된 창", padding="10")
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Treeview로 창 목록 표시
        columns = ('프로세스', '창 제목', '상태')
        self.tree = ttk.Treeview(list_frame, columns=columns, show='tree headings', height=10)
        
        # 컬럼 설정
        self.tree.heading('#0', text='ID')
        self.tree.heading('프로세스', text='프로세스')
        self.tree.heading('창 제목', text='창 제목')
        self.tree.heading('상태', text='상태')
        
        self.tree.column('#0', width=50)
        self.tree.column('프로세스', width=120)
        self.tree.column('창 제목', width=200)
        self.tree.column('상태', width=80)
        
        # 스크롤바
        scrollbar = ttk.Scrollbar(list_frame, orient='vertical', command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # 더블클릭 이벤트
        self.tree.bind('<Double-Button-1>', self.on_double_click)
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(10, 0))
        
        self.toggle_btn = ttk.Button(button_frame, text="숨기기/보이기 토글", 
                                    command=self.toggle_selected_window)
        self.toggle_btn.pack(side=tk.LEFT, padx=5)
        
        ttk.Button(button_frame, text="새로고침", command=self.refresh_window_list).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="모두 보이기", command=self.show_all_windows).pack(side=tk.LEFT, padx=5)
        
        # 자동 모니터링 체크박스
        self.auto_monitor_var = tk.BooleanVar()
        auto_check = ttk.Checkbutton(button_frame, text="자동 모니터링", 
                                     variable=self.auto_monitor_var,
                                     command=self.toggle_monitoring)
        auto_check.pack(side=tk.RIGHT, padx=5)
        
        # 상태바
        self.status_label = ttk.Label(self.root, text="준비됨", relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM)
        
        # 창 닫기 이벤트
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def get_process_name(self, hwnd):
        """창 핸들로부터 프로세스 이름 가져오기"""
        try:
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            process = psutil.Process(pid)
            return process.name()
        except:
            return "Unknown"
    
    def find_browser_network_windows(self):
        """브라우저의 '네트워크 연결' 창 찾기"""
        browser_processes = ['chrome.exe', 'firefox.exe', 'msedge.exe', 'iexplore.exe', 
                            'safari.exe', 'opera.exe', 'brave.exe']
        windows = []
        
        def enum_window_callback(hwnd, windows):
            if win32gui.IsWindowVisible(hwnd):
                window_text = win32gui.GetWindowText(hwnd)
                # 정확히 "네트워크 연결" 제목인 창만 찾기
                if window_text == "네트워크 연결" or window_text.lower() == "network connection":
                    process_name = self.get_process_name(hwnd)
                    # 브라우저 프로세스인지 확인
                    if any(browser in process_name.lower() for browser in browser_processes):
                        windows.append((hwnd, process_name, window_text))
            return True
        
        try:
            win32gui.EnumWindows(enum_window_callback, windows)
        except:
            pass
        return windows
    
    def refresh_window_list(self):
        """창 목록 새로고침"""
        # 기존 항목 삭제
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # 창 찾기
        windows = self.find_browser_network_windows()
        
        if windows:
            for hwnd, process_name, title in windows:
                # 창 상태 확인
                is_hidden = self.window_states.get(hwnd, False)
                status = "숨김" if is_hidden else "표시"
                
                # 트리에 추가
                self.tree.insert('', 'end', text=str(hwnd), 
                               values=(process_name, title, status))
            
            self.status_label.config(text=f"{len(windows)}개의 창 발견")
        else:
            self.tree.insert('', 'end', text="", 
                           values=("", "브라우저 '네트워크 연결' 창 없음", ""))
            self.status_label.config(text="창을 찾을 수 없습니다")
    
    def toggle_selected_window(self):
        """선택된 창 토글"""
        selection = self.tree.selection()
        if not selection:
            messagebox.showwarning("선택 없음", "토글할 창을 선택하세요.")
            return
        
        item = selection[0]
        hwnd = int(self.tree.item(item)['text'])
        self.toggle_window(hwnd)
    
    def on_double_click(self, event):
        """더블클릭으로 토글"""
        self.toggle_selected_window()
    
    def toggle_window(self, hwnd):
        """창 숨기기/보이기 토글"""
        try:
            is_hidden = self.window_states.get(hwnd, False)
            
            if is_hidden:
                # 보이기
                win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                self.window_states[hwnd] = False
                self.status_label.config(text="창을 표시했습니다")
            else:
                # 숨기기
                win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                self.window_states[hwnd] = True
                self.status_label.config(text="창을 숨겼습니다")
            
            self.refresh_window_list()
        except Exception as e:
            messagebox.showerror("오류", f"창 상태를 변경할 수 없습니다: {str(e)}")
    
    def show_all_windows(self):
        """모든 창 보이기"""
        shown_count = 0
        for hwnd, is_hidden in list(self.window_states.items()):
            if is_hidden:
                try:
                    win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                    self.window_states[hwnd] = False
                    shown_count += 1
                except:
                    # 창이 닫혔을 수 있음
                    del self.window_states[hwnd]
        
        self.refresh_window_list()
        if shown_count > 0:
            messagebox.showinfo("완료", f"{shown_count}개의 창을 표시했습니다.")
        else:
            messagebox.showinfo("정보", "숨겨진 창이 없습니다.")
    
    def toggle_monitoring(self):
        """자동 모니터링 토글"""
        if self.auto_monitor_var.get():
            self.start_monitoring()
        else:
            self.stop_monitoring()
    
    def start_monitoring(self):
        """모니터링 시작"""
        self.is_monitoring = True
        self.status_label.config(text="자동 모니터링 중...")
        
        def monitor():
            while self.is_monitoring:
                # 3초마다 새로운 창 체크
                windows = self.find_browser_network_windows()
                for hwnd, _, _ in windows:
                    if hwnd not in self.window_states:
                        # 새로운 창 발견 - 자동으로 숨김
                        try:
                            win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                            self.window_states[hwnd] = True
                            self.root.after(0, self.refresh_window_list)
                        except:
                            pass
                time.sleep(3)
        
        self.monitoring_thread = threading.Thread(target=monitor, daemon=True)
        self.monitoring_thread.start()
    
    def stop_monitoring(self):
        """모니터링 중지"""
        self.is_monitoring = False
        self.status_label.config(text="모니터링 중지됨")
    
    def on_closing(self):
        """프로그램 종료"""
        self.is_monitoring = False
        
        # 숨긴 창 복원
        hidden_count = sum(1 for is_hidden in self.window_states.values() if is_hidden)
        if hidden_count > 0:
            result = messagebox.askyesno("종료", 
                                        f"{hidden_count}개의 숨긴 창이 있습니다.\n"
                                        "모두 표시하고 종료하시겠습니까?")
            if result:
                self.show_all_windows()
        
        self.root.destroy()

def main():
    # Windows 체크
    import platform
    if platform.system() != 'Windows':
        messagebox.showerror("오류", "이 프로그램은 Windows에서만 실행됩니다.")
        return
    
    # 필요한 패키지 체크
    try:
        import win32gui
        import win32con
        import win32process
        import psutil
    except ImportError:
        messagebox.showerror("오류", 
                           "필요한 패키지가 없습니다.\n\n"
                           "pip install pywin32 psutil")
        return
    
    root = tk.Tk()
    app = BrowserWindowHider(root)
    root.mainloop()

if __name__ == "__main__":
    main()