import os
import shutil
import tkinter as tk
from tkinter import filedialog

# Define the directories to organize files
desktop_path = os.path.expanduser("~/Desktop")
organized_path = os.path.join(desktop_path, "Organized")

# Create the organized directory if it doesn't exist
if not os.path.exists(organized_path):
    os.mkdir(organized_path)

# Define the file extensions and corresponding directories
extensions = {
    "txt": "Text Files",
    "doc": "Word Documents",
    "docx": "Word Documents",
    "pdf": "PDF Files",
    "jpg": "Images",
    "png": "Images",
    "gif": "Images",
    "xlsx": "Excel Spreadsheets",
    "ppt": "PowerPoint Presentations",
    "pptx": "PowerPoint Presentations",
    "zip": "ZIP Archives",
    "rar": "RAR Archives",
    "py": "Python Files"
}

def browse_files():
    """Open a file dialog to choose the directory to organize"""
    global desktop_path
    desktop_path = filedialog.askdirectory()
    if desktop_path:
        browse_label.config(text=desktop_path)
        organize_files_button.config(state=tk.NORMAL)
    else:
        browse_label.config(text="")

def organize_files():
    """Organize the files based on their extensions into directories"""
    global organized_path
    organized_path = os.path.join(desktop_path, "Organized")
    if not os.path.exists(organized_path):
        os.mkdir(organized_path)
    for filename in os.listdir(desktop_path):
        if filename.endswith(tuple(extensions.keys())):
            extension = filename.split(".")[-1]
            if extension in extensions:
                dir_name = extensions[extension]
                dir_path = os.path.join(organized_path, dir_name)
                if not os.path.exists(dir_path):
                    os.mkdir(dir_path)
                src_path = os.path.join(desktop_path, filename)
                dst_path = os.path.join(dir_path, filename)
                shutil.move(src_path, dst_path)
    tk.messagebox.showinfo(title="Organize Desktop", message="Files organized successfully!")

# Create the GUI
root = tk.Tk()
root.title("Organize Desktop")

# Add widgets to the GUI
browse_label = tk.Label(root, text="Choose the directory to organize:")
browse_label.pack(pady=10)

browse_button = tk.Button(root, text="Browse", command=browse_files)
browse_button.pack(pady=10)

organize_files_button = tk.Button(root, text="Organize Files", state=tk.DISABLED, command=organize_files)
organize_files_button.pack(pady=10)

# Start the GUI
root.mainloop()
