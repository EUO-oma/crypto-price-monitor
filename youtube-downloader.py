import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import os
import threading
import subprocess
import sys
import webbrowser # 웹 브라우저 모듈 추가
import logging
import datetime

class YouTubeDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("YouTube Downloader")
        self.root.geometry("600x380") # 창 크기 늘림
        self.root.resizable(False, False)

        # 설정 파일 경로
        self.CONFIG_FILE = os.path.join(os.path.expanduser("~"), ".youtube_downloader_config.txt")
        
        # 에러 로그 설정
        self.setup_error_logging()

        # 스타일 설정
        self.style = ttk.Style()
        self.style.theme_use('clam') # 'clam', 'alt', 'default', 'classic' 등 시도 가능

        # 프레임 생성
        self.main_frame = ttk.Frame(root, padding="20 20 20 20")
        self.main_frame.pack(fill=tk.BOTH, expand=True)

        # URL 입력 라벨
        self.url_label = ttk.Label(self.main_frame, text="YouTube URL:")
        self.url_label.grid(row=0, column=0, sticky=tk.W, pady=(0, 5))

        # URL 입력 필드와 버튼을 위한 프레임
        self.url_input_frame = ttk.Frame(self.main_frame)
        self.url_input_frame.grid(row=1, column=0, columnspan=2, sticky=(tk.W, tk.E), pady=(0, 10))

        self.url_entry = ttk.Entry(self.url_input_frame, width=50) # 폭 조정
        self.url_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        # Clear 버튼 (X 버튼)
        self.clear_button = ttk.Button(self.url_input_frame, text="X", width=3, command=self.clear_url_entry)
        self.clear_button.pack(side=tk.LEFT, padx=(0, 5))

        # Open YouTube 버튼
        self.open_youtube_button = ttk.Button(self.url_input_frame, text="Open YouTube", command=self.open_youtube_url)
        self.open_youtube_button.pack(side=tk.LEFT)

        # 다운로드 및 붙여넣기 버튼을 위한 프레임
        self.button_frame = ttk.Frame(self.main_frame)
        self.button_frame.grid(row=2, column=0, columnspan=2, pady=(0, 15))

        # 다운로드 버튼 (비디오)
        self.download_video_button = ttk.Button(self.button_frame, text="Download Video", command=lambda: self.start_download_thread("video"))
        self.download_video_button.pack(side=tk.LEFT, padx=(0, 10))

        # 다운로드 버튼 (MP3)
        self.download_mp3_button = ttk.Button(self.button_frame, text="Download MP3", command=lambda: self.start_download_thread("mp3"))
        self.download_mp3_button.pack(side=tk.LEFT, padx=(0, 10))

        # 자막 다운로드 버튼 (모든 언어의 자막 및 자동 생성 자막 포함)
        self.download_subtitle_button = ttk.Button(self.button_frame, text="Download Subtitles", command=lambda: self.start_download_thread("subtitle"))
        self.download_subtitle_button.pack(side=tk.LEFT, padx=(0, 10))

        # 클립보드 붙여넣기 버튼
        self.paste_button = ttk.Button(self.button_frame, text="Paste from Clipboard", command=self.paste_from_clipboard)
        self.paste_button.pack(side=tk.LEFT)

        # --- 저장 경로 관련 위젯 ---
        self.download_path_var = tk.StringVar() # 저장 경로를 담을 변수
        self.load_config() # 설정 파일에서 경로 불러오기

        self.path_label = ttk.Label(self.main_frame, text="Save to:")
        self.path_label.grid(row=3, column=0, sticky=tk.W, pady=(10, 5))

        self.path_entry = ttk.Entry(self.main_frame, textvariable=self.download_path_var, width=50, state="readonly")
        self.path_entry.grid(row=4, column=0, sticky=(tk.W, tk.E), padx=(0, 5))

        self.browse_button = ttk.Button(self.main_frame, text="Browse", command=self.browse_folder)
        self.browse_button.grid(row=4, column=1, sticky=tk.E)

        # 상태 메시지 라벨
        self.status_label = ttk.Label(self.main_frame, text="Ready", foreground="blue")
        self.status_label.grid(row=5, column=0, columnspan=2, sticky=tk.W, pady=(10, 0))

        # 그리드 컬럼/로우 가중치 설정 (창 크기 조절 시 위젯 비율 유지)
        self.main_frame.grid_columnconfigure(1, weight=1)
        self.main_frame.grid_rowconfigure(6, weight=1) # 여유 공간 확보

    def setup_error_logging(self):
        """에러 로그 설정"""
        log_dir = os.path.dirname(os.path.abspath(__file__))
        log_file = os.path.join(log_dir, "youtube_downloader_errors.log")
        
        logging.basicConfig(
            level=logging.ERROR,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler()  # 콘솔에도 출력
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info(f"YouTube Downloader started at {datetime.datetime.now()}")

    def log_error(self, operation, error, additional_info=""):
        """에러를 로그 파일에 기록"""
        error_msg = f"Operation: {operation} | Error: {str(error)} | Additional: {additional_info}"
        self.logger.error(error_msg)
        print(f"❌ ERROR: {error_msg}")  # 콘솔에도 출력

    def clear_url_entry(self):
        """URL 입력 필드의 내용을 지웁니다."""
        self.url_entry.delete(0, tk.END)

    def open_youtube_url(self):
        """URL 입력 필드의 URL을 기본 웹 브라우저로 엽니다."""
        url = self.url_entry.get()
        if url:
            try:
                webbrowser.open(url)
            except Exception as e:
                messagebox.showerror("Error", f"Could not open URL: {e}")
        else:
            messagebox.showwarning("Input Error", "Please enter a YouTube URL to open.")


    def load_config(self):
        """설정 파일에서 저장 경로를 불러옵니다."""
        if os.path.exists(self.CONFIG_FILE):
            with open(self.CONFIG_FILE, "r") as f:
                saved_path = f.readline().strip()
                if os.path.isdir(saved_path):
                    self.download_path_var.set(saved_path)
                else:
                    self.download_path_var.set(self.get_documents_folder())
        else:
            self.download_path_var.set(self.get_documents_folder())

    def save_config(self, path):
        """현재 저장 경로를 설정 파일에 저장합니다."""
        with open(self.CONFIG_FILE, "w") as f:
            f.write(path)

    def browse_folder(self):
        """사용자가 다운로드 폴더를 선택할 수 있도록 합니다."""
        folder_selected = filedialog.askdirectory(
            initialdir=self.download_path_var.get() or self.get_documents_folder(),
            title="Select Download Folder"
        )
        if folder_selected:
            self.download_path_var.set(folder_selected)
            self.save_config(folder_selected)

    def paste_from_clipboard(self):
        """클립보드 내용을 URL 입력 필드에 붙여넣습니다."""
        try:
            clipboard_content = self.root.clipboard_get()
            self.url_entry.delete(0, tk.END)
            self.url_entry.insert(0, clipboard_content)
        except tk.TclError:
            messagebox.showwarning("Clipboard Error", "No text found in clipboard or access denied.")

    def get_documents_folder(self):
        """운영체제에 따라 문서 폴더 경로를 반환합니다."""
        if sys.platform == "win32":
            import winreg
            try:
                # Windows Known Folder GUID for Documents
                # {FDD39AD0-238F-46BD-B27B-34200CE25322}
                key = winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                                     r"SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders")
                path = winreg.QueryValueEx(key, "{FDD39AD0-238F-46BD-B27B-34200CE25322}")[0]
                winreg.CloseKey(key)
                return path
            except Exception:
                return os.path.join(os.path.expanduser("~"), "Documents")
        elif sys.platform == "darwin": # macOS
            return os.path.join(os.path.expanduser("~"), "Documents")
        else: # Linux and other Unix-like systems
            return os.path.join(os.path.expanduser("~"), "Documents")

    def start_download_thread(self, format_type):
        """다운로드 작업을 별도의 스레드에서 시작합니다."""
        url = self.url_entry.get()
        if not url:
            messagebox.showwarning("Input Error", "Please enter a YouTube URL.")
            return

        self.status_label.config(text="Downloading...", foreground="orange")
        self.download_video_button.config(state=tk.DISABLED) # 다운로드 중 버튼 비활성화
        self.download_mp3_button.config(state=tk.DISABLED) # 다운로드 중 버튼 비활성화
        self.download_subtitle_button.config(state=tk.DISABLED) # 다운로드 중 버튼 비활성화

        # 다운로드 작업을 별도의 스레드에서 실행
        download_thread = threading.Thread(target=self.download_video, args=(url, format_type,))
        download_thread.start()

    def download_video(self, url, format_type):
        """실제 비디오 다운로드 로직 (yt-dlp 사용)."""
        output_path = self.download_path_var.get()
        if not os.path.exists(output_path):
            os.makedirs(output_path)

        # 현재 다운로드 경로를 설정 파일에 저장
        self.save_config(output_path)

        try:
            # yt-dlp 명령어 구성
            # -o: 출력 파일 이름 및 경로 (%(title)s.%(ext)s는 제목과 확장자로 저장)
            # --no-playlist: 플레이리스트가 아닌 단일 영상만 다운로드
            # -f: 포맷 선택
            # --extract-audio --audio-format mp3 --audio-quality 0: MP3 추출 옵션

            base_command = [
                "yt-dlp",
                "--no-playlist",
                url
            ]

            if format_type == "video":
                # 최적의 mp4 비디오+오디오 또는 최적의 mp4 포맷 다운로드
                # YouTube의 새로운 보안 정책에 대응하기 위한 옵션 추가
                format_options = [
                    "-f", "best[ext=mp4]/bestvideo[ext=mp4]+bestaudio[ext=m4a]/best",
                    "--no-check-certificate",  # SSL 인증서 검증 비활성화
                    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "--referer", "https://www.youtube.com/",
                    "--add-header", "Accept-Language:en-US,en;q=0.9",
                    "--cookies-from-browser", "chrome"  # Chrome 쿠키 사용
                ]
                output_template = os.path.join(output_path, "%(title)s.%(ext)s")
            elif format_type == "mp3":
                # MP3 추출
                format_options = [
                    "--extract-audio", 
                    "--audio-format", "mp3", 
                    "--audio-quality", "0",
                    "--no-check-certificate",
                    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "--cookies-from-browser", "chrome"
                ]
                output_template = os.path.join(output_path, "%(title)s.%(ext)s") # .mp3로 저장될 것임
            elif format_type == "subtitle":
                # 자막 다운로드 (모든 언어, 자동 생성 자막 포함)
                format_options = [
                    "--write-subs", 
                    "--write-auto-subs", 
                    "--sub-langs", "all", 
                    "--skip-download",
                    "--no-check-certificate",
                    "--user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "--cookies-from-browser", "chrome"
                ]
                # 임시로 기본 템플릿 사용 (후에 .md로 변환)
                output_template = os.path.join(output_path, "%(title)s.%(ext)s")
            else:
                raise ValueError("Invalid format type specified.")

            command = base_command + format_options + ["-o", output_template]

            # 서브프로세스로 yt-dlp 실행
            process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)
            
            # Chrome 쿠키 접근 오류 확인
            stderr_initial = process.stderr.readline()
            if "browser chrome" in stderr_initial.lower() and "not found" in stderr_initial.lower():
                # Chrome 쿠키 없이 재시도
                print("Chrome 쿠키를 찾을 수 없습니다. 쿠키 없이 재시도합니다...")
                process.terminate()
                
                # 쿠키 옵션 제거
                format_options = [opt for opt in format_options if opt != "--cookies-from-browser" and opt != "chrome"]
                command = base_command + format_options + ["-o", output_template]
                process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, bufsize=1)

            downloaded_file_path = None
            # 실시간 출력 읽기 (진행 상황 업데이트)
            for line in iter(process.stdout.readline, ''):
                if "ETA" in line or "%" in line:
                    self.root.after(0, self.status_label.config, {"text": f"Progress: {line.strip()}", "foreground": "blue"})
                elif "Destination" in line:
                    self.root.after(0, self.status_label.config, {"text": f"Saving: {line.strip()}", "foreground": "darkgreen"})
                    # 다운로드된 파일 경로 파싱 (yt-dlp 출력에서 "Destination: " 다음 부분)
                    downloaded_file_path = line.split("Destination: ", 1)[1].strip()
                elif "already been downloaded" in line:
                    self.root.after(0, self.status_label.config, {"text": f"Already downloaded: {line.strip()}", "foreground": "darkgreen"})
                    # 이미 다운로드된 경우에도 파일 경로 파싱 시도
                    if "to " in line:
                        downloaded_file_path = line.split("to ", 1)[1].strip()
                elif "Extracting audio" in line or "Converting" in line:
                    self.root.after(0, self.status_label.config, {"text": f"Processing audio: {line.strip()}", "foreground": "purple"})

            process.stdout.close()
            stderr_output = process.stderr.read()
            process.stderr.close()
            return_code = process.wait()

            if return_code == 0:
                if format_type == "subtitle":
                    # 자막 파일 다운로드 완료 - 변환 옵션 제공
                    self.root.after(0, self.status_label.config, {"text": "Subtitles Download Complete!", "foreground": "green"})
                    
                    # 변환 확인 다이얼로그 표시
                    self.show_subtitle_conversion_dialog(output_path)
                else:
                    self.root.after(0, self.status_label.config, {"text": "Download Complete!", "foreground": "green"})
                    if downloaded_file_path and os.path.exists(downloaded_file_path):
                        response = messagebox.askyesno("Download Complete", 
                                                       f"Video/Audio downloaded successfully to {output_path}!\n\nDo you want to open the file location?")
                        if response:
                            self.open_file_location(downloaded_file_path)
                    else:
                        messagebox.showinfo("Download Complete", f"Video/Audio downloaded successfully to {output_path}!")
            else:
                error_message = f"Download failed: {stderr_output.strip()}"
                self.root.after(0, self.status_label.config, {"text": error_message, "foreground": "red"})
                
                # YouTube 보안 관련 에러 확인
                if "nsig extraction failed" in stderr_output or "Requested format is not available" in stderr_output:
                    update_msg = (
                        "YouTube의 보안 정책이 변경되었습니다.\n\n"
                        "해결 방법:\n"
                        "1. yt-dlp를 최신 버전으로 업데이트하세요:\n"
                        "   터미널에서: pip install -U yt-dlp\n\n"
                        "2. 그래도 안 되면 다음 명령을 시도하세요:\n"
                        "   yt-dlp --rm-cache-dir\n\n"
                        "3. VPN을 사용 중이라면 끄고 시도해보세요.\n\n"
                        "원본 에러:\n" + error_message[:200]
                    )
                    messagebox.showerror("YouTube 다운로드 오류", update_msg)
                else:
                    messagebox.showerror("Error", error_message)

        except Exception as e:
            self.log_error("download_video", e, f"URL: {url}, Format: {format_type}")
            error_message = f"An unexpected error occurred: {e}"
            self.root.after(0, self.status_label.config, {"text": error_message, "foreground": "red"})
            messagebox.showerror("Error", error_message)
        finally:
            self.root.after(0, lambda: self.download_video_button.config(state=tk.NORMAL)) # 다운로드 완료/실패 후 버튼 활성화
            self.root.after(0, lambda: self.download_mp3_button.config(state=tk.NORMAL)) # 다운로드 완료/실패 후 버튼 활성화
            self.root.after(0, lambda: self.download_subtitle_button.config(state=tk.NORMAL)) # 다운로드 완료/실패 후 버튼 활성화

    def process_subtitle_files(self, output_path):
        """자막 파일들을 .md로 변환하고 000 접두사를 추가합니다."""
        converted_files = []
        try:
            import glob
            
            print(f"🔍 Looking for subtitle files in: {output_path}")
            
            # 자막 파일들 찾기 (.vtt, .srt 확장자)
            subtitle_files = []
            for ext in ['*.vtt', '*.srt']:
                pattern = os.path.join(output_path, ext)
                found_files = glob.glob(pattern)
                subtitle_files.extend(found_files)
                print(f"Found {len(found_files)} files with pattern {pattern}")
            
            print(f"📁 Total subtitle files found: {len(subtitle_files)}")
            for f in subtitle_files:
                print(f"  - {f}")
            
            if not subtitle_files:
                self.log_error("process_subtitle_files", "No subtitle files found", f"Path: {output_path}")
                return []
            
            for subtitle_file in subtitle_files:
                try:
                    print(f"🔄 Processing: {subtitle_file}")
                    
                    # 파일명에서 000 접두사와 .md 확장자로 새 이름 생성
                    base_name = os.path.basename(subtitle_file)
                    name_without_ext = os.path.splitext(base_name)[0]
                    
                    # 000 접두사 추가하고 .md 확장자로 변경
                    new_name = f"000_{name_without_ext}.md"
                    new_path = os.path.join(output_path, new_name)
                    
                    print(f"📝 Converting {base_name} -> {new_name}")
                    
                    # 자막 파일 내용을 읽어서 .md 형식으로 변환
                    with open(subtitle_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    print(f"📖 Read {len(content)} characters from {subtitle_file}")
                    
                    # VTT/SRT 형식을 단순한 텍스트로 변환 (타임스탬프 제거)
                    cleaned_content = self.clean_subtitle_content(content)
                    
                    print(f"🧹 Cleaned content length: {len(cleaned_content)} characters")
                    
                    # .md 파일로 저장
                    with open(new_path, 'w', encoding='utf-8') as f:
                        f.write(cleaned_content)
                    
                    print(f"💾 Saved to: {new_path}")
                    
                    # 파일이 정상적으로 생성되었는지 확인
                    if os.path.exists(new_path):
                        # 원본 자막 파일 삭제
                        os.remove(subtitle_file)
                        print(f"✅ Converted: {base_name} -> {new_name}")
                        converted_files.append(new_path)
                    else:
                        raise Exception(f"Failed to create file: {new_path}")
                    
                except Exception as file_error:
                    self.log_error("process_subtitle_file", file_error, f"File: {subtitle_file}")
                    print(f"❌ Error processing {subtitle_file}: {file_error}")
                    
        except Exception as e:
            self.log_error("process_subtitle_files", e, f"Path: {output_path}")
            print(f"❌ Error in process_subtitle_files: {e}")
        
        print(f"✨ Total converted files: {len(converted_files)}")
        return converted_files

    def clean_subtitle_content(self, content):
        """자막 내용을 가사 편집기 프로젝트에 적합한 형식으로 변환합니다."""
        import re
        
        lines = content.split('\n')
        cleaned_lines = []
        
        for line in lines:
            line = line.strip()
            
            # VTT 헤더 건너뛰기
            if line.startswith('WEBVTT') or line.startswith('Kind:') or line.startswith('Language:'):
                continue
                
            # 타임스탬프 라인 건너뛰기 (00:00:00.000 --> 00:00:05.000 형식)
            if '-->' in line:
                continue
                
            # 숫자만 있는 라인 건너뛰기 (SRT 인덱스)
            if line.isdigit():
                continue
                
            # HTML 태그 제거
            line = re.sub(r'<[^>]+>', '', line)
            
            # 음악 표기나 효과음 제거 [음악], (박수소리) 등
            line = re.sub(r'\[.*?\]', '', line)
            line = re.sub(r'\(.*?\)', '', line)
            
            # 빈 줄이 아니면 추가
            if line:
                cleaned_lines.append(line)
        
        # 중복 제거
        unique_lines = []
        for line in cleaned_lines:
            if line not in unique_lines:
                unique_lines.append(line)
        
        # 가사 편집기 프로젝트에 적합한 형식으로 변환
        return self.format_for_lyric_editor(unique_lines)
    
    def format_for_lyric_editor(self, lines):
        """가사 편집기 프로젝트에 최적화된 형식으로 변환"""
        if not lines:
            return "제목\n아티스트\n"
        
        # 첫 번째 줄을 제목으로, 두 번째 줄을 아티스트로 사용
        # 만약 가사가 너무 길면 첫 두 줄을 제목/아티스트로 추정
        formatted_lines = []
        
        # 제목과 아티스트 추가 (기본값)
        if len(lines) > 0:
            # 첫 번째 줄이 짧으면 제목으로 사용
            first_line = lines[0]
            if len(first_line) < 50:
                formatted_lines.append(first_line)  # 제목
                formatted_lines.append("YouTube Subtitle")  # 기본 아티스트
                start_index = 1
            else:
                formatted_lines.append("YouTube Video")  # 기본 제목
                formatted_lines.append("Unknown Artist")  # 기본 아티스트
                start_index = 0
        else:
            formatted_lines.append("YouTube Video")
            formatted_lines.append("Unknown Artist")
            start_index = 0
        
        # 나머지 줄들을 가사로 추가
        for i in range(start_index, len(lines)):
            line = lines[i].strip()
            if line:
                formatted_lines.append(line)
        
        return '\n'.join(formatted_lines)

    def show_subtitle_conversion_dialog(self, output_path):
        """자막 파일 변환 확인 다이얼로그를 표시합니다."""
        import glob
        
        # 다운로드된 자막 파일들 찾기
        subtitle_files = []
        for ext in ['*.vtt', '*.srt']:
            subtitle_files.extend(glob.glob(os.path.join(output_path, ext)))
        
        if not subtitle_files:
            messagebox.showinfo("자막 다운로드 완료", f"자막이 {output_path}에 다운로드되었습니다.")
            return
        
        # 파일 목록 표시
        file_list = "\n".join([f"• {os.path.basename(f)}" for f in subtitle_files[:3]])
        if len(subtitle_files) > 3:
            file_list += f"\n... 외 {len(subtitle_files) - 3}개 파일"
        
        message = f"자막 다운로드 완료!\n\n다운로드된 파일들:\n{file_list}\n\n저장 위치: {output_path}"
        
        # 변환 옵션 제공
        response = messagebox.askyesnocancel(
            "자막 변환", 
            f"{message}\n\n자막을 가사 편집기용 형식으로 변환하시겠습니까?\n\n'예': 변환하고 가사 편집기로 열기\n'아니오': 변환만 하기\n'취소': 원본 파일 그대로 두기"
        )
        
        if response is True:  # 예 - 변환하고 가사 편집기로 열기
            converted_files = self.advanced_convert_subtitle_files(output_path)
            if converted_files:
                self.open_with_lyric_editor(converted_files[0])
        elif response is False:  # 아니오 - 변환만 하기
            converted_files = self.advanced_convert_subtitle_files(output_path)
            if converted_files:
                messagebox.showinfo("변환 완료", f"{len(converted_files)}개 파일이 변환되었습니다.")
                self.open_file_location(converted_files[0])
        # 취소 - 아무것도 하지 않음

    def show_conversion_dialog(self, output_path, converted_files):
        """다운로드 완료 후 컨버팅 옵션 다이얼로그를 표시합니다. (기존 버전 호환용)"""
        if not converted_files:
            messagebox.showinfo("자막 다운로드 완료", f"자막이 {output_path}에 다운로드되었습니다.")
            return
            
        # 기본 완료 메시지
        file_list = "\n".join([f"• {os.path.basename(f)}" for f in converted_files[:5]])  # 최대 5개만 표시
        if len(converted_files) > 5:
            file_list += f"\n... 외 {len(converted_files) - 5}개 파일"
        
        message = f"자막 다운로드 및 변환 완료!\n\n변환된 파일들:\n{file_list}\n\n저장 위치: {output_path}"
        
        # 추가 옵션 제공
        response = messagebox.askyesnocancel(
            "자막 다운로드 완료", 
            f"{message}\n\n파일 위치를 열어보시겠습니까?\n\n'예': 파일 위치 열기\n'아니오': 가사 편집기로 첫 번째 파일 열기\n'취소': 닫기"
        )
        
        if response is True:  # 예 - 파일 위치 열기
            self.open_file_location(converted_files[0])
        elif response is False:  # 아니오 - 가사 편집기로 열기
            self.open_with_lyric_editor(converted_files[0])
        # 취소 - 아무것도 하지 않음

    def open_with_lyric_editor(self, file_path):
        """가사 편집기로 파일을 열어봅니다."""
        try:
            editor_path = os.path.join(os.path.dirname(__file__), "01 _lyric_editor_player_remake_v3.py")
            if os.path.exists(editor_path):
                subprocess.Popen([sys.executable, editor_path, file_path])
                messagebox.showinfo("가사 편집기 실행", f"가사 편집기로 파일을 열었습니다:\n{os.path.basename(file_path)}")
            else:
                messagebox.showwarning("가사 편집기 없음", f"가사 편집기를 찾을 수 없습니다.\n경로: {editor_path}")
        except Exception as e:
            messagebox.showerror("실행 오류", f"가사 편집기 실행 중 오류가 발생했습니다:\n{e}")

    def advanced_convert_subtitle_files(self, output_path):
        """VTT/SRT 파일을 개선된 로직으로 변환합니다."""
        converted_files = []
        try:
            import glob
            import re
            
            print(f"🔍 Looking for subtitle files in: {output_path}")
            
            # 자막 파일들 찾기 (.vtt, .srt 확장자)
            subtitle_files = []
            for ext in ['*.vtt', '*.srt']:
                pattern = os.path.join(output_path, ext)
                found_files = glob.glob(pattern)
                subtitle_files.extend(found_files)
                print(f"Found {len(found_files)} files with pattern {pattern}")
            
            print(f"📁 Total subtitle files found: {len(subtitle_files)}")
            
            if not subtitle_files:
                self.log_error("advanced_convert_subtitle_files", "No subtitle files found", f"Path: {output_path}")
                return []
            
            # 모든 자막 파일을 하나로 통합 변환
            all_content = ""
            for subtitle_file in subtitle_files:
                try:
                    print(f"🔄 Processing: {subtitle_file}")
                    
                    # 자막 파일 내용을 읽어서 통합
                    with open(subtitle_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    all_content += content + "\n"
                    
                    print(f"📖 Read {len(content)} characters from {subtitle_file}")
                    
                except Exception as file_error:
                    self.log_error("advanced_convert_subtitle_file", file_error, f"File: {subtitle_file}")
                    print(f"❌ Error reading {subtitle_file}: {file_error}")
            
            if all_content:
                # 통합된 내용을 개선된 로직으로 변환
                print(f"🧹 Processing combined content: {len(all_content)} characters")
                cleaned_content = self.advanced_clean_subtitle_content(all_content)
                
                # 고정된 파일명으로 저장
                new_name = "000_downloaded_lyrics.md"
                new_path = os.path.join(output_path, new_name)
                
                print(f"📝 Converting to: {new_name}")
                
                # .md 파일로 저장
                with open(new_path, 'w', encoding='utf-8') as f:
                    f.write(cleaned_content)
                
                print(f"💾 Saved to: {new_path}")
                
                # 파일이 정상적으로 생성되었는지 확인
                if os.path.exists(new_path):
                    # 원본 자막 파일들 삭제
                    for subtitle_file in subtitle_files:
                        try:
                            os.remove(subtitle_file)
                            print(f"🗑️ Removed: {os.path.basename(subtitle_file)}")
                        except:
                            pass
                    
                    print(f"✅ Successfully created: {new_name}")
                    converted_files.append(new_path)
                else:
                    raise Exception(f"Failed to create file: {new_path}")
                    
        except Exception as e:
            self.log_error("advanced_convert_subtitle_files", e, f"Path: {output_path}")
            print(f"❌ Error in advanced_convert_subtitle_files: {e}")
        
        print(f"✨ Total converted files: {len(converted_files)}")
        return converted_files

    def advanced_clean_subtitle_content(self, content):
        """개선된 자막 정리 로직 - VTT 형식에 최적화"""
        import re
        
        lines = content.split('\n')
        processed_entries = []
        current_time = None
        current_texts = []
        
        print(f"🔍 Processing {len(lines)} lines from VTT file")
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            # VTT 헤더 및 스타일 정보 건너뛰기
            if (line.startswith('WEBVTT') or line.startswith('Kind:') or 
                line.startswith('Language:') or line.startswith('Style:') or
                line.startswith('::cue') or line.startswith('##') or 
                line.startswith('}') or not line):
                continue
            
            # 타임스탬프 라인 감지 (00:00:16.633 --> 00:00:16.700)
            timestamp_match = re.match(r'(\d{2}:\d{2}:\d{2}\.\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}\.\d{3})', line)
            if timestamp_match:
                # 시작 시간만 추출하여 초 단위로 변환
                start_time = timestamp_match.group(1)
                current_time = self.convert_timestamp_to_seconds(start_time)
                current_texts = []
                continue
            
            # 타임스탬프 라인 감지 개선
            timestamp_match = re.match(r'(\d{2}:\d{2}:\d{2}[.,]\d{3})\s+-->\s+(\d{2}:\d{2}:\d{2}[.,]\d{3})', line)
            if timestamp_match:
                start_time = timestamp_match.group(1).replace(',', '.')
                current_time = self.convert_timestamp_to_seconds(start_time)
                current_texts = []
                continue
            
            # SRT 인덱스 번호 건너뛰기
            if line.isdigit():
                continue
            
            # 자막 텍스트 라인 처리
            if current_time is not None and line:
                # HTML 태그와 컬러 태그 모두 제거
                clean_line = self.remove_vtt_tags(line)
                if clean_line:
                    current_texts.append(clean_line)
        
        # 마지막 엔트리 처리
        if current_time is not None and current_texts:
            unique_texts = self.deduplicate_subtitle_texts(current_texts)
            if unique_texts:
                processed_entries.append({
                    'time': current_time,
                    'texts': unique_texts
                })
        
        print(f"📝 Found {len(processed_entries)} raw subtitle entries")
        
        # 중복 시간대 엔트리 통합 처리
        processed_entries = self.merge_duplicate_time_entries(processed_entries)
        
        print(f"✨ Processed {len(processed_entries)} unique subtitle entries")
        
        # 최종 포맷 생성
        return self.format_for_advanced_lyric_editor(processed_entries)

    def convert_timestamp_to_seconds(self, timestamp):
        """타임스탬프를 초 단위로 변환 (00:00:16.633 -> 16.63)"""
        parts = timestamp.split(':')
        hours = int(parts[0])
        minutes = int(parts[1])
        seconds_parts = parts[2].split('.')
        seconds = int(seconds_parts[0])
        milliseconds = int(seconds_parts[1])
        
        total_seconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000
        return round(total_seconds, 2)

    def remove_vtt_tags(self, text):
        """VTT 태그들을 제거하고 순수한 텍스트만 추출"""
        import re
        
        # 컬러 태그 제거: <c.colorXXX><b>text</b></c>
        text = re.sub(r'<c\.[^>]*>', '', text)
        text = re.sub(r'</c>', '', text)
        text = re.sub(r'<b>', '', text)
        text = re.sub(r'</b>', '', text)
        text = re.sub(r'<[^>]+>', '', text)  # 기타 HTML 태그
        
        # 불필요한 문자 제거 (zero-width space 등)
        text = re.sub(r'[\u200B-\u200D\uFEFF]', '', text)
        text = re.sub(r'[​\u00A0]', ' ', text)  # 특수 공백 문자
        
        return text.strip()

    def deduplicate_subtitle_texts(self, texts):
        """중복된 자막 텍스트 제거 및 정리"""
        unique_texts = []
        seen = set()
        
        for text in texts:
            text = text.strip()
            if text and text not in seen:
                unique_texts.append(text)
                seen.add(text)
        
        return unique_texts

    def format_for_advanced_lyric_editor(self, entries):
        """가사 편집기 프로젝트에 최적화된 고급 포맷"""
        if not entries:
            return "제목\n아티스트\n"
        
        # 제목과 아티스트 추가 (첫 번째 엔트리에서 추정)
        formatted_lines = []
        
        # 첫 번째 텍스트가 짧으면 제목으로 사용
        first_entry = entries[0] if entries else None
        if first_entry and first_entry['texts']:
            first_text = first_entry['texts'][0]
            if len(first_text) < 30:
                formatted_lines.append(first_text)  # 제목
                formatted_lines.append("YouTube Subtitle")  # 아티스트
            else:
                formatted_lines.append("YouTube Video")  # 기본 제목
                formatted_lines.append("Unknown Artist")  # 기본 아티스트
        else:
            formatted_lines.append("YouTube Video")
            formatted_lines.append("Unknown Artist")
        
        # 타임스탬프와 함께 가사 추가
        for entry in entries:
            time_str = f"[{entry['time']:.2f}]"
            
            # 다중 언어가 있는 경우 각각 별도 라인으로
            for text in entry['texts']:
                formatted_lines.append(f"{time_str} {text}")
        
        return '\n'.join(formatted_lines)

    def merge_duplicate_time_entries(self, entries):
        """시간차이가 작은 중복만 제거 (가사 반복은 보존)"""
        if not entries:
            return []
        
        # 시간순 정렬
        sorted_entries = sorted(entries, key=lambda x: x['time'])
        
        # 1단계: 연속 중복 제거 (바로 앞과 같은 내용)
        consecutive_removed = self.remove_consecutive_duplicates(sorted_entries)
        
        # 2단계: 1초 이내의 매우 가까운 중복만 병합
        smart_merged = self.smart_merge_similar_entries(consecutive_removed)
        
        # 3단계: 최종 간소화 (옵션)
        if len(smart_merged) > 200:
            smart_merged = self.simplify_timeline(smart_merged)
        
        return smart_merged

    def remove_consecutive_duplicates(self, entries):
        """연속으로 나오는 동일한 내용 제거 (시간 간격 무관)"""
        if not entries:
            return []
        
        filtered = [entries[0]]  # 첫 번째는 항상 포함
        
        for i in range(1, len(entries)):
            current_entry = entries[i]
            previous_entry = filtered[-1]
            
            # 바로 앞 엔트리와 텍스트가 완전히 같으면 제거
            if not self.are_texts_identical(previous_entry['texts'], current_entry['texts']):
                filtered.append(current_entry)
        
        return filtered

    def are_texts_identical(self, texts1, texts2):
        """두 텍스트 그룹이 완전히 동일한지 확인"""
        return set(texts1) == set(texts2)

    def consolidate_identical_entries(self, entries):
        """완전히 동일한 텍스트 내용을 가진 엔트리들을 통합"""
        content_groups = {}
        
        for entry in entries:
            # 텍스트 내용을 키로 사용 (순서 상관없이)
            text_key = tuple(sorted(entry['texts']))
            
            if text_key not in content_groups:
                content_groups[text_key] = []
            content_groups[text_key].append(entry)
        
        consolidated = []
        for text_key, group in content_groups.items():
            if len(group) == 1:
                # 중복이 없는 경우 그대로 추가
                consolidated.append(group[0])
            else:
                # 중복이 있는 경우 가장 이른 시간으로 통합
                earliest_time = min(e['time'] for e in group)
                consolidated.append({
                    'time': earliest_time,
                    'texts': list(text_key)
                })
        
        return sorted(consolidated, key=lambda x: x['time'])

    def smart_merge_similar_entries(self, entries):
        """아주 가까운 시간의 word-by-word 중복만 병합"""
        if not entries:
            return []
        
        merged = []
        current_group = [entries[0]]
        
        for i in range(1, len(entries)):
            current_entry = entries[i]
            last_in_group = current_group[-1]
            
            # 조건을 더 엄격하게: 1초 이내 + 90% 이상 유사도
            time_diff = current_entry['time'] - last_in_group['time']
            if time_diff <= 1.0 and self.are_texts_very_similar(last_in_group['texts'], current_entry['texts']):
                current_group.append(current_entry)
            else:
                # 현재 그룹을 처리하고 새 그룹 시작
                merged.append(self.merge_group(current_group))
                current_group = [current_entry]
        
        # 마지막 그룹 처리
        if current_group:
            merged.append(self.merge_group(current_group))
        
        return merged

    def are_texts_similar(self, texts1, texts2):
        """두 텍스트 그룹이 유사한지 확인 (70% 기준)"""
        set1 = set(texts1)
        set2 = set(texts2)
        
        if not set1 or not set2:
            return False
        
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        similarity = intersection / union if union > 0 else 0
        return similarity >= 0.7

    def are_texts_very_similar(self, texts1, texts2):
        """두 텍스트 그룹이 매우 유사한지 확인 (90% 기준 - word-by-word 중복용)"""
        set1 = set(texts1)
        set2 = set(texts2)
        
        if not set1 or not set2:
            return False
        
        intersection = len(set1 & set2)
        union = len(set1 | set2)
        
        similarity = intersection / union if union > 0 else 0
        return similarity >= 0.9

    def merge_group(self, group):
        """유사한 엔트리 그룹을 하나로 병합"""
        if len(group) == 1:
            return group[0]
        
        # 가장 이른 시간 사용
        earliest_time = min(e['time'] for e in group)
        
        # 모든 고유한 텍스트를 수집
        all_texts = []
        seen_texts = set()
        
        for entry in group:
            for text in entry['texts']:
                if text not in seen_texts:
                    all_texts.append(text)
                    seen_texts.add(text)
        
        return {
            'time': earliest_time,
            'texts': all_texts
        }

    def simplify_timeline(self, entries):
        """타임라인을 더 간소화 (최소 2초 간격 유지)"""
        if not entries:
            return []
        
        simplified = [entries[0]]  # 첫 번째는 항상 포함
        
        for entry in entries[1:]:
            last_time = simplified[-1]['time']
            
            # 2초 이상 차이나는 경우만 추가
            if entry['time'] - last_time >= 2.0:
                simplified.append(entry)
            else:
                # 기존 엔트리에 새 텍스트 병합
                for text in entry['texts']:
                    if text not in simplified[-1]['texts']:
                        simplified[-1]['texts'].append(text)
        
        return simplified

    def open_file_location(self, file_path):
        """운영체제에 따라 파일이 있는 폴더를 열고 파일을 선택합니다."""
        if sys.platform == "win32":
            # Windows: explorer.exe /select,"path\to\file"
            subprocess.Popen(f'explorer.exe /select,"{file_path}"')
        elif sys.platform == "darwin": # macOS
            # macOS: open -R "path/to/file"
            subprocess.Popen(['open', '-R', file_path])
        else: # Linux (xdg-open for general desktop environment)
            # Linux: xdg-open "path/to/file" (opens folder, may not select file)
            # Fallback to opening the directory if selecting is not straightforward
            subprocess.Popen(['xdg-open', os.path.dirname(file_path)])

if __name__ == "__main__":
    root = tk.Tk()
    app = YouTubeDownloaderApp(root)
    root.mainloop()