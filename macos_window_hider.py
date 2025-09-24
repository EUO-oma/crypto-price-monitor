import tkinter as tk
from tkinter import ttk, messagebox
import subprocess
import re

class MacOSWindowHider:
    def __init__(self, root):
        self.root = root
        self.root.title("macOS 창 숨김 도구")
        self.root.geometry("500x400")
        
        # 숨긴 앱들 저장
        self.hidden_apps = set()
        
        # GUI 구성
        self.setup_gui()
        
        # 초기 앱 목록 로드
        self.refresh_app_list()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="macOS 앱 창 숨김 도구", 
                               font=("Arial", 16, "bold"))
        title_label.pack(pady=(0, 10))
        
        # 설명
        desc_label = ttk.Label(main_frame, 
                              text="특정 제목의 창을 가진 앱을 숨기거나 보이게 합니다",
                              foreground="gray")
        desc_label.pack(pady=(0, 20))
        
        # 창 제목 입력
        input_frame = ttk.LabelFrame(main_frame, text="찾을 창 제목", padding="10")
        input_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.window_title_var = tk.StringVar(value="네트워크에 연결")
        self.title_entry = ttk.Entry(input_frame, textvariable=self.window_title_var,
                                    font=("Arial", 12))
        self.title_entry.pack(fill=tk.X)
        
        # 앱 목록
        list_frame = ttk.LabelFrame(main_frame, text="발견된 앱", padding="10")
        list_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
        
        # 리스트박스
        self.app_listbox = tk.Listbox(list_frame, height=8, font=("Arial", 11))
        self.app_listbox.pack(fill=tk.BOTH, expand=True)
        
        # 스크롤바
        scrollbar = ttk.Scrollbar(self.app_listbox)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.app_listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.app_listbox.yview)
        
        # 더블클릭 이벤트
        self.app_listbox.bind('<Double-Button-1>', lambda e: self.toggle_selected_app())
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(20, 0))
        
        # 검색 버튼
        self.search_btn = ttk.Button(button_frame, text="창 검색", 
                                    command=self.search_windows)
        self.search_btn.pack(side=tk.LEFT, padx=5)
        
        # 토글 버튼
        self.toggle_btn = tk.Button(
            button_frame,
            text="선택 앱 숨기기/보이기",
            command=self.toggle_selected_app,
            bg="#007AFF",
            fg="white",
            font=("Arial", 12),
            width=20,
            height=2,
            relief=tk.FLAT,
            cursor="hand2"
        )
        self.toggle_btn.pack(side=tk.LEFT, padx=5)
        
        # 모두 보이기 버튼
        ttk.Button(button_frame, text="모두 보이기", 
                  command=self.show_all_apps).pack(side=tk.LEFT, padx=5)
        
        # 상태 레이블
        self.status_label = ttk.Label(main_frame, text="", foreground="gray")
        self.status_label.pack(pady=(10, 0))
        
    def get_window_list(self):
        """AppleScript로 모든 창 정보 가져오기"""
        script = '''
        tell application "System Events"
            set appList to {}
            repeat with proc in application processes
                if visible of proc is true then
                    set appName to name of proc
                    try
                        set windowList to {}
                        repeat with win in windows of proc
                            set winTitle to name of win
                            set end of windowList to winTitle
                        end repeat
                        if length of windowList > 0 then
                            set end of appList to {appName, windowList}
                        end if
                    end try
                end if
            end repeat
            return appList
        end tell
        '''
        
        try:
            result = subprocess.run(['osascript', '-e', script], 
                                  capture_output=True, text=True)
            return self.parse_applescript_output(result.stdout)
        except:
            return []
    
    def parse_applescript_output(self, output):
        """AppleScript 출력 파싱"""
        apps = []
        # 간단한 파싱 (실제로는 더 복잡할 수 있음)
        app_pattern = r'([^,]+), \{([^}]*)\}'
        matches = re.findall(app_pattern, output)
        
        for match in matches:
            app_name = match[0].strip()
            window_titles = [title.strip() for title in match[1].split(',')]
            apps.append((app_name, window_titles))
        
        return apps
    
    def search_windows(self):
        """특정 제목의 창을 가진 앱 검색"""
        target_title = self.window_title_var.get().strip()
        if not target_title:
            messagebox.showwarning("경고", "창 제목을 입력하세요.")
            return
        
        self.app_listbox.delete(0, tk.END)
        self.status_label.config(text=f"'{target_title}' 창 검색 중...")
        
        # 간단한 데모용 앱 목록 (실제로는 AppleScript 사용)
        demo_apps = [
            ("Safari", ["네트워크에 연결", "Google", "Apple"]),
            ("Chrome", ["네트워크에 연결", "YouTube"]),
            ("Firefox", ["Mozilla Firefox"]),
        ]
        
        found_apps = []
        for app_name, windows in demo_apps:
            if any(target_title in window for window in windows):
                found_apps.append(app_name)
                status = " [숨김]" if app_name in self.hidden_apps else ""
                self.app_listbox.insert(tk.END, f"{app_name}{status}")
        
        if found_apps:
            self.status_label.config(text=f"{len(found_apps)}개 앱에서 '{target_title}' 창 발견")
        else:
            self.status_label.config(text=f"'{target_title}' 창을 찾을 수 없습니다")
    
    def refresh_app_list(self):
        """앱 목록 새로고침"""
        self.app_listbox.delete(0, tk.END)
        
        # 데모용 앱 목록
        apps = ["Safari", "Chrome", "Firefox", "Mail", "Messages"]
        for app in apps:
            status = " [숨김]" if app in self.hidden_apps else ""
            self.app_listbox.insert(tk.END, f"{app}{status}")
    
    def toggle_selected_app(self):
        """선택된 앱 토글"""
        selection = self.app_listbox.curselection()
        if not selection:
            messagebox.showwarning("선택 없음", "토글할 앱을 선택하세요.")
            return
        
        app_text = self.app_listbox.get(selection[0])
        app_name = app_text.replace(" [숨김]", "")
        
        if app_name in self.hidden_apps:
            self.show_app(app_name)
        else:
            self.hide_app(app_name)
        
        self.refresh_app_list()
    
    def hide_app(self, app_name):
        """앱 숨기기"""
        script = f'tell application "{app_name}" to set visible to false'
        
        try:
            subprocess.run(['osascript', '-e', script])
            self.hidden_apps.add(app_name)
            self.status_label.config(text=f"{app_name}을(를) 숨겼습니다")
        except Exception as e:
            messagebox.showerror("오류", f"앱을 숨길 수 없습니다: {str(e)}")
    
    def show_app(self, app_name):
        """앱 보이기"""
        script = f'tell application "{app_name}" to set visible to true'
        
        try:
            subprocess.run(['osascript', '-e', script])
            self.hidden_apps.discard(app_name)
            self.status_label.config(text=f"{app_name}을(를) 표시했습니다")
        except Exception as e:
            messagebox.showerror("오류", f"앱을 표시할 수 없습니다: {str(e)}")
    
    def show_all_apps(self):
        """모든 앱 보이기"""
        for app in list(self.hidden_apps):
            self.show_app(app)
        
        self.refresh_app_list()
        messagebox.showinfo("완료", "모든 앱을 표시했습니다.")
    
    def minimize_window_by_title(self, app_name, window_title):
        """특정 제목의 창 최소화 (macOS)"""
        script = f'''
        tell application "{app_name}"
            repeat with w in windows
                if name of w contains "{window_title}" then
                    set miniaturized of w to true
                end if
            end repeat
        end tell
        '''
        
        try:
            subprocess.run(['osascript', '-e', script])
        except:
            pass

def main():
    root = tk.Tk()
    app = MacOSWindowHider(root)
    root.mainloop()

if __name__ == "__main__":
    main()