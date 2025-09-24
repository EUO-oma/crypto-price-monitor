import tkinter as tk
from tkinter import ttk, messagebox
import win32gui
import win32con
import win32process
import psutil

class WindowSelectorHider:
    def __init__(self, root):
        self.root = root
        self.root.title("창 선택 숨김 도구")
        self.root.geometry("600x500")
        
        # 창 정보 저장 {hwnd: (title, process_name, is_hidden)}
        self.window_info = {}
        
        # GUI 구성
        self.setup_gui()
        
        # 초기 창 목록 로드
        self.refresh_window_list()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="15")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="윈도우 창 선택 숨김", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 10))
        
        # 검색/필터 프레임
        search_frame = ttk.Frame(main_frame)
        search_frame.pack(fill=tk.X, pady=(0, 10))
        
        ttk.Label(search_frame, text="필터:").pack(side=tk.LEFT, padx=(0, 5))
        self.filter_var = tk.StringVar()
        self.filter_entry = ttk.Entry(search_frame, textvariable=self.filter_var, width=30)
        self.filter_entry.pack(side=tk.LEFT, padx=(0, 10))
        self.filter_entry.bind('<KeyRelease>', lambda e: self.apply_filter())
        
        ttk.Button(search_frame, text="새로고침", command=self.refresh_window_list).pack(side=tk.LEFT)
        
        # 창 목록
        list_frame = ttk.LabelFrame(main_frame, text="창 목록", padding="10")
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(0, 10))
        
        # Treeview
        columns = ('프로세스', '창 제목', '상태')
        self.tree = ttk.Treeview(list_frame, columns=columns, show='tree headings', height=15)
        
        # 컬럼 설정
        self.tree.heading('#0', text='선택')
        self.tree.heading('프로세스', text='프로세스')
        self.tree.heading('창 제목', text='창 제목')
        self.tree.heading('상태', text='상태')
        
        self.tree.column('#0', width=50)
        self.tree.column('프로세스', width=120)
        self.tree.column('창 제목', width=300)
        self.tree.column('상태', width=80)
        
        # 스크롤바
        scrollbar_y = ttk.Scrollbar(list_frame, orient='vertical', command=self.tree.yview)
        scrollbar_x = ttk.Scrollbar(list_frame, orient='horizontal', command=self.tree.xview)
        self.tree.configure(yscrollcommand=scrollbar_y.set, xscrollcommand=scrollbar_x.set)
        
        self.tree.grid(row=0, column=0, sticky='nsew')
        scrollbar_y.grid(row=0, column=1, sticky='ns')
        scrollbar_x.grid(row=1, column=0, sticky='ew')
        
        list_frame.grid_rowconfigure(0, weight=1)
        list_frame.grid_columnconfigure(0, weight=1)
        
        # 더블클릭 이벤트
        self.tree.bind('<Double-Button-1>', self.on_double_click)
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X)
        
        # 선택 숨기기/보이기 버튼
        self.toggle_btn = tk.Button(
            button_frame,
            text="선택 창 숨기기/보이기",
            command=self.toggle_selected,
            font=("Arial", 11, "bold"),
            bg="#2196F3",
            fg="white",
            width=20,
            height=2,
            cursor="hand2"
        )
        self.toggle_btn.pack(side=tk.LEFT, padx=5)
        
        # 모두 보이기 버튼
        ttk.Button(button_frame, text="모두 보이기", 
                  command=self.show_all_windows).pack(side=tk.LEFT, padx=5)
        
        # 숨긴 창만 보기 체크박스
        self.show_hidden_only_var = tk.BooleanVar()
        ttk.Checkbutton(button_frame, text="숨긴 창만 표시", 
                       variable=self.show_hidden_only_var,
                       command=self.apply_filter).pack(side=tk.RIGHT, padx=5)
        
        # 상태바
        self.status_label = ttk.Label(self.root, text="준비", relief=tk.SUNKEN, anchor=tk.W)
        self.status_label.pack(fill=tk.X, side=tk.BOTTOM)
        
        # 창 닫기 이벤트
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
        
    def get_process_name(self, hwnd):
        """프로세스 이름 가져오기"""
        try:
            _, pid = win32process.GetWindowThreadProcessId(hwnd)
            process = psutil.Process(pid)
            return process.name()
        except:
            return "Unknown"
    
    def get_all_windows(self):
        """모든 창 가져오기"""
        windows = []
        
        def enum_window_callback(hwnd, result):
            if win32gui.IsWindowVisible(hwnd):
                window_text = win32gui.GetWindowText(hwnd)
                if window_text:  # 제목이 있는 창만
                    process_name = self.get_process_name(hwnd)
                    windows.append((hwnd, window_text, process_name))
            return True
        
        try:
            win32gui.EnumWindows(enum_window_callback, None)
        except:
            pass
        
        return windows
    
    def refresh_window_list(self):
        """창 목록 새로고침"""
        # 기존 항목 제거
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # 모든 창 가져오기
        windows = self.get_all_windows()
        
        # 창 정보 업데이트
        for hwnd, title, process in windows:
            # 이미 추적 중인 창인지 확인
            if hwnd in self.window_info:
                _, _, is_hidden = self.window_info[hwnd]
            else:
                is_hidden = False
                self.window_info[hwnd] = (title, process, is_hidden)
            
            # 트리에 추가
            status = "숨김" if is_hidden else "표시"
            self.tree.insert('', 'end', text=str(hwnd), 
                           values=(process, title, status))
        
        # 상태바 업데이트
        hidden_count = sum(1 for _, _, hidden in self.window_info.values() if hidden)
        self.status_label.config(text=f"전체: {len(windows)}개 | 숨김: {hidden_count}개")
        
    def apply_filter(self):
        """필터 적용"""
        filter_text = self.filter_var.get().lower()
        show_hidden_only = self.show_hidden_only_var.get()
        
        # 모든 항목 제거
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # 필터에 맞는 항목만 추가
        for hwnd, (title, process, is_hidden) in self.window_info.items():
            # 숨긴 창만 보기 필터
            if show_hidden_only and not is_hidden:
                continue
            
            # 텍스트 필터
            if filter_text and filter_text not in title.lower() and filter_text not in process.lower():
                continue
            
            # 트리에 추가
            status = "숨김" if is_hidden else "표시"
            self.tree.insert('', 'end', text=str(hwnd), 
                           values=(process, title, status))
    
    def toggle_selected(self):
        """선택된 창 토글"""
        selection = self.tree.selection()
        if not selection:
            messagebox.showwarning("선택 없음", "토글할 창을 선택하세요.")
            return
        
        for item in selection:
            hwnd = int(self.tree.item(item)['text'])
            self.toggle_window(hwnd)
        
        self.refresh_window_list()
    
    def on_double_click(self, event):
        """더블클릭으로 토글"""
        self.toggle_selected()
    
    def toggle_window(self, hwnd):
        """창 숨기기/보이기 토글"""
        try:
            if hwnd in self.window_info:
                title, process, is_hidden = self.window_info[hwnd]
                
                if is_hidden:
                    # 보이기
                    win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                    self.window_info[hwnd] = (title, process, False)
                else:
                    # 숨기기
                    win32gui.ShowWindow(hwnd, win32con.SW_HIDE)
                    self.window_info[hwnd] = (title, process, True)
        except Exception as e:
            messagebox.showerror("오류", f"창 상태 변경 실패: {str(e)}")
    
    def show_all_windows(self):
        """모든 창 보이기"""
        shown_count = 0
        
        for hwnd, (title, process, is_hidden) in list(self.window_info.items()):
            if is_hidden:
                try:
                    win32gui.ShowWindow(hwnd, win32con.SW_SHOW)
                    self.window_info[hwnd] = (title, process, False)
                    shown_count += 1
                except:
                    # 창이 닫혔을 수 있음
                    del self.window_info[hwnd]
        
        self.refresh_window_list()
        
        if shown_count > 0:
            messagebox.showinfo("완료", f"{shown_count}개의 창을 복원했습니다.")
        else:
            messagebox.showinfo("정보", "숨긴 창이 없습니다.")
    
    def on_closing(self):
        """프로그램 종료"""
        # 숨긴 창 확인
        hidden_windows = [(hwnd, title) for hwnd, (title, _, hidden) in self.window_info.items() if hidden]
        
        if hidden_windows:
            result = messagebox.askyesno("종료", 
                                       f"{len(hidden_windows)}개의 숨긴 창이 있습니다.\n"
                                       "모두 복원하고 종료하시겠습니까?")
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
    app = WindowSelectorHider(root)
    root.mainloop()

if __name__ == "__main__":
    main()