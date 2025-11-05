import tkinter as tk
from tkinter import ttk, messagebox
import subprocess

class MacOSWindowMinimizer:
    def __init__(self, root):
        self.root = root
        self.root.title("macOS 창 최소화 도구")
        self.root.geometry("500x400")
        
        # 최소화한 창 정보 저장
        self.minimized_windows = []
        
        # GUI 구성
        self.setup_gui()
        
    def setup_gui(self):
        # 메인 프레임
        main_frame = ttk.Frame(self.root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # 제목
        title_label = ttk.Label(main_frame, text="macOS 창 최소화 도구", 
                               font=("SF Pro Display", 16, "bold"))
        title_label.pack(pady=(0, 10))
        
        # 설명
        desc_label = ttk.Label(main_frame, 
                              text="특정 제목을 포함한 창을 최소화합니다",
                              foreground="gray")
        desc_label.pack(pady=(0, 20))
        
        # 창 제목 입력
        input_frame = ttk.LabelFrame(main_frame, text="찾을 창 제목", padding="10")
        input_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.window_title_var = tk.StringVar(value="네트워크에 연결")
        self.title_entry = ttk.Entry(input_frame, textvariable=self.window_title_var,
                                    font=("SF Pro Display", 12))
        self.title_entry.pack(fill=tk.X, pady=(0, 5))
        
        # 앱 선택
        app_frame = ttk.Frame(input_frame)
        app_frame.pack(fill=tk.X)
        
        ttk.Label(app_frame, text="앱:").pack(side=tk.LEFT, padx=(0, 5))
        
        self.app_var = tk.StringVar(value="Safari")
        self.app_combo = ttk.Combobox(app_frame, textvariable=self.app_var,
                                     values=["Safari", "Google Chrome", "Firefox", "모든 앱"],
                                     width=20)
        self.app_combo.pack(side=tk.LEFT)
        
        # 결과 표시
        result_frame = ttk.LabelFrame(main_frame, text="결과", padding="10")
        result_frame.pack(fill=tk.BOTH, expand=True, pady=(10, 0))
        
        self.result_text = tk.Text(result_frame, height=6, font=("SF Mono", 11))
        self.result_text.pack(fill=tk.BOTH, expand=True)
        
        # 버튼 프레임
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill=tk.X, pady=(20, 0))
        
        # 최소화 버튼
        self.minimize_btn = tk.Button(
            button_frame,
            text="창 최소화",
            command=self.minimize_windows,
            bg="#007AFF",
            fg="white",
            font=("SF Pro Display", 12, "bold"),
            width=15,
            height=2,
            relief=tk.FLAT,
            cursor="hand2"
        )
        self.minimize_btn.pack(side=tk.LEFT, padx=5)
        
        # 모든 창 복원 버튼
        ttk.Button(button_frame, text="모든 창 복원", 
                  command=self.restore_all_windows).pack(side=tk.LEFT, padx=5)
        
        # 새로고침 버튼
        ttk.Button(button_frame, text="창 목록 보기", 
                  command=self.list_windows).pack(side=tk.LEFT, padx=5)
        
    def minimize_windows(self):
        """창 최소화"""
        window_title = self.window_title_var.get().strip()
        app_name = self.app_var.get()
        
        if not window_title:
            messagebox.showwarning("경고", "창 제목을 입력하세요.")
            return
        
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, f"'{window_title}'를 포함한 창 최소화 중...\n\n")
        
        if app_name == "모든 앱":
            # 모든 앱에서 검색
            apps = ["Safari", "Google Chrome", "Firefox", "Microsoft Edge"]
            for app in apps:
                self.minimize_app_windows(app, window_title)
        else:
            # 특정 앱에서만 검색
            self.minimize_app_windows(app_name, window_title)
    
    def minimize_app_windows(self, app_name, window_title):
        """특정 앱의 창 최소화"""
        script = f'''
        tell application "{app_name}"
            set minimized_count to 0
            try
                repeat with w in windows
                    if name of w contains "{window_title}" then
                        set miniaturized of w to true
                        set minimized_count to minimized_count + 1
                    end if
                end repeat
                return minimized_count
            on error
                return 0
            end try
        end tell
        '''
        
        try:
            result = subprocess.run(['osascript', '-e', script], 
                                  capture_output=True, text=True)
            count = int(result.stdout.strip()) if result.stdout.strip().isdigit() else 0
            
            if count > 0:
                self.result_text.insert(tk.END, f"✅ {app_name}: {count}개 창 최소화됨\n")
                self.minimized_windows.append((app_name, window_title, count))
            else:
                self.result_text.insert(tk.END, f"❌ {app_name}: 일치하는 창 없음\n")
        except Exception as e:
            self.result_text.insert(tk.END, f"⚠️ {app_name}: 오류 발생\n")
    
    def list_windows(self):
        """현재 열린 창 목록 보기"""
        self.result_text.delete(1.0, tk.END)
        self.result_text.insert(tk.END, "현재 열린 창 목록:\n\n")
        
        apps = ["Safari", "Google Chrome", "Firefox"]
        for app in apps:
            script = f'''
            tell application "{app}"
                set window_list to {{}}
                try
                    repeat with w in windows
                        set end of window_list to name of w
                    end repeat
                    return window_list
                on error
                    return {{}}
                end try
            end tell
            '''
            
            try:
                result = subprocess.run(['osascript', '-e', script], 
                                      capture_output=True, text=True)
                if result.stdout.strip():
                    self.result_text.insert(tk.END, f"{app}:\n")
                    # 간단한 파싱
                    windows = result.stdout.strip().split(', ')
                    for window in windows:
                        if window:
                            self.result_text.insert(tk.END, f"  • {window}\n")
                    self.result_text.insert(tk.END, "\n")
            except:
                pass
    
    def restore_all_windows(self):
        """모든 창 복원"""
        script = '''
        tell application "System Events"
            click (first button of (every window of (first application process whose frontmost is true)) whose role description is "minimize button")
        end tell
        '''
        
        messagebox.showinfo("안내", 
                          "macOS에서는 최소화된 창을 자동으로 복원할 수 없습니다.\n"
                          "Dock에서 최소화된 창을 클릭하여 복원하세요.")

def main():
    root = tk.Tk()
    
    # macOS 스타일 적용
    root.configure(bg='#F5F5F5')
    style = ttk.Style()
    style.theme_use('aqua')
    
    app = MacOSWindowMinimizer(root)
    root.mainloop()

if __name__ == "__main__":
    main()