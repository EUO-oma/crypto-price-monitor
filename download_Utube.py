import glob
import os.path

# from pytube import YouTube
from pytube import Playlist

'''
참고사이트
https://vincinotes.com/%ED%8C%8C%EC%9D%B4%EC%8D%AC-pytube%EB%A1%9C-%EC%9C%A0%ED%8A%9C%EB%B8%8C-%EC%98%81%EC%83%81%EA%B3%BC-%EC%9D%8C%EC%9B%90-%EC%B6%94%EC%B6%9C%ED%95%98%EA%B8%B0/
https://m.blog.naver.com/dsz08082/221753467977
https://pytube.io/en/latest/index.html
'''

# # 유튜브 전용 인스턴스 생성
# par = "https://www.youtube.com/watch?v=5MS-GpklkHs&list=RDQMhhhwHsaZJlg&start_radio=1"
# yt = YouTube(par)
# yt.streams.filter(only_audio=True).all()
#
# # 특정영상 다운로드
# yt.streams.filter(only_audio=True).first().download()


# 성경
# p = Playlist('https://youtube.com/playlist?list=PLjj_uvKdTemCy7cZmkOJLApAJx1NPV-f6')
# 트로트
p = Playlist('https://youtube.com/playlist?list=PLo-Ua2eTwWRIuXByN2VtsvyIQGnOAh0Yy')


print(len(p.videos))

# 다운받기
for video in p.videos:
    # download 함수 안에 경로를 넣을 수 있음
    # video.streams.get_by_itag(140).download('./성경')
    video.streams.get_by_itag(140).download()
    print(f'{video.title} : success')

print("다운로드 완료되고 확장자 변경 진행 ")

# 확장자 변경
# files = glob.glob("./성경/*.mp4")

# 확장자 변경 로직
# 폴더에 있는 mp4 -> mp3 변환
files = glob.glob("*.mp4")
for x in files:
    if not os.path.isdir(x):
        filename = os.path.splitext(x)
        try:
            os.rename(x, filename[0] + '.mp3')
        except:
            pass
