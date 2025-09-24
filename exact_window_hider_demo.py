import tkinter as tk
from tkinter import ttk, messagebox
import random

class ExactWindowHiderDemo:
    def __init__(self, root):
        self.root = root
        self.root.title("특정 창 이름 숨김 도구 (데모)")
        self.root.geometry("400x350")
        
        # 데모용 가상 창들
        self.demo_windows = [
            {"id": 1, "title": "네트워크에 연결", "visible": True},
            {"id": 2, "title": "Chrome - Google", "visible": True},
            {"id": 3, "title": "네트워크에 연결", "visible": True},
            {"id": 4, "title": "Microsoft Edge", "visible": True},
            {"id": 5, "title": "네트워크 설정", "visible": True},
            {"id": 6, "title": "네트워크에 연결", "visible": True},
        ]
        
        # 숨긴 창들
        self.hidden_windows = []
        
        # 찾을 창 이름
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
        title_label.pack(pady=(0, 10))
        
        # 데모 알림
        demo_label = ttk.Label(main_frame, text="⚠️ 데모 버전 - Windows에서만 실제 작동",
                              foreground="red")
        demo_label.pack(pady=(0, 10))
        
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
        
        self.status_text = tk.Text(status_frame, height=6, width=40, font=("Arial", 10))
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
            cursor="hand2"
        )
        self.toggle_btn.pack(side=tk.LEFT, padx=5)
        
        # 검색 버튼
        self.search_btn = ttk.Button(button_frame, text="창 검색", 
                                    command=self.search_windows)
        self.search_btn.pack(side=tk.LEFT, padx=5)
        
        # 창 추가 버튼 (데모용)
        self.add_btn = ttk.Button(button_frame, text="데모 창 추가", 
                                 command=self.add_demo_window)
        self.add_btn.pack(side=tk.LEFT, padx=5)
        
        # 초기 상태 표시
        self.update_status()
        
    def find_exact_windows(self, window_name):
        """정확히 일치하는 이름의 창 찾기 (데모)"""
        return [(w["id"], w["title"]) for w in self.demo_windows 
                if w["title"] == window_name and w["visible"]]
    
    def search_windows(self):
        """창 검색 및 표시"""
        window_name = self.window_name_var.get().strip()
        if not window_name:
            messagebox.showwarning("경고", "창 이름을 입력하세요.")
            return
        
        # 일치하는 창 찾기
        matching_windows = [w for w in self.demo_windows if w["title"] == window_name]
        
        self.status_text.delete(1.0, tk.END)
        self.status_text.insert(tk.END, f"🔍 '{window_name}' 검색 결과:\n\n")
        
        if matching_windows:
            visible_count = sum(1 for w in matching_windows if w["visible"])
            hidden_count = sum(1 for w in matching_windows if not w["visible"])
            
            self.status_text.insert(tk.END, f"✅ 총 {len(matching_windows)}개 발견\n")
            self.status_text.insert(tk.END, f"  • 표시: {visible_count}개\n")
            self.status_text.insert(tk.END, f"  • 숨김: {hidden_count}개\n")
        else:
            self.status_text.insert(tk.END, "❌ 일치하는 창이 없습니다.\n")
            
        # 모든 창 목록 표시
        self.status_text.insert(tk.END, "\n📋 전체 창 목록:\n")
        for window in self.demo_windows:
            status = "🔒" if not window["visible"] else "👁"
            self.status_text.insert(tk.END, f"  {status} {window['title']}\n")
    
    def toggle_windows(self):
        """창 토글"""
        window_name = self.window_name_var.get().strip()
        if not window_name:
            messagebox.showwarning("경고", "창 이름을 입력하세요.")
            return
        
        # 숨긴 창이 있는지 확인
        has_hidden = any(w["title"] == window_name and not w["visible"] 
                        for w in self.demo_windows)
        
        if has_hidden:
            # 숨긴 창 보이기
            self.show_windows(window_name)
        else:
            # 창 숨기기
            self.hide_windows(window_name)
    
    def hide_windows(self, window_name):
        """창 숨기기"""
        hidden_count = 0
        
        for window in self.demo_windows:
            if window["title"] == window_name and window["visible"]:
                window["visible"] = False
                self.hidden_windows.append(window)
                hidden_count += 1
        
        if hidden_count > 0:
            self.toggle_btn.config(text="다시 보이기", bg="#4CAF50")
            messagebox.showinfo("완료", f"{hidden_count}개의 '{window_name}' 창을 숨겼습니다.")
        else:
            messagebox.showinfo("알림", f"표시된 '{window_name}' 창이 없습니다.")
            
        self.update_status()
    
    def show_windows(self, window_name):
        """창 보이기"""
        shown_count = 0
        
        for window in self.demo_windows:
            if window["title"] == window_name and not window["visible"]:
                window["visible"] = True
                if window in self.hidden_windows:
                    self.hidden_windows.remove(window)
                shown_count += 1
        
        if shown_count > 0:
            self.toggle_btn.config(text="숨기기/보이기\n토글", bg="#2196F3")
            messagebox.showinfo("완료", f"{shown_count}개의 '{window_name}' 창을 복원했습니다.")
            
        self.update_status()
    
    def add_demo_window(self):
        """데모 창 추가"""
        window_names = ["네트워크에 연결", "Chrome", "Edge", "Firefox", "네트워크 설정"]
        new_id = len(self.demo_windows) + 1
        new_window = {
            "id": new_id,
            "title": random.choice(window_names),
            "visible": True
        }
        self.demo_windows.append(new_window)
        self.update_status()
        messagebox.showinfo("추가됨", f"새 창 추가: {new_window['title']}")
    
    def update_status(self):
        """상태 업데이트"""
        self.status_text.delete(1.0, tk.END)
        
        # 숨긴 창 표시
        hidden_windows = [w for w in self.demo_windows if not w["visible"]]
        
        if hidden_windows:
            self.status_text.insert(tk.END, "🔒 숨긴 창:\n")
            for window in hidden_windows:
                self.status_text.insert(tk.END, f"  • {window['title']}\n")
            self.status_text.insert(tk.END, f"\n총 {len(hidden_windows)}개 숨김")
        else:
            self.status_text.insert(tk.END, "현재 숨긴 창이 없습니다.\n")
            self.status_text.insert(tk.END, "\n창 이름을 입력하고 검색하세요.")

def main():
    root = tk.Tk()
    app = ExactWindowHiderDemo(root)
    root.mainloop()

if __name__ == "__main__":
    main()