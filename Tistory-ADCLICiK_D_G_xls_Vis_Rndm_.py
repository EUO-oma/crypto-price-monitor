# -*- coding: utf-8 -*-
import pyautogui
import time
import random
from selenium import webdriver
from selenium.webdriver import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


chrome_options = Options()
    # 헤드리스 실행하기
#chrome_options.add_argument('headless') # headless
chrome_options.add_argument('--mute-audio')
chrome_options.add_argument('disable-gpu')
chrome_options.add_argument("window-size=150x280")  # 화면크기(전체화면)
chrome_options.add_argument("disable-infobars")
chrome_options.add_argument("--disable-extensions")\
    # 브라우저 실행하기



# 크롬 드라이버 다운받기
# https://chromedriver.chromium.org/downloads

def GoogleSearch반복하기(search_keyword):

    # 네이버로 이동하기
    str_url = 'https://www.google.com/search?q=' 
    add_query = search_keyword
    made_url = str_url + add_query

    WEB_OPENING(made_url)



def WEB_OPENING(made_url):
    driver = webdriver.Chrome("chromedriver.exe", options=chrome_options)
    driver.maximize_window()
    driver.get(made_url)
    driver.implicitly_wait(15)
    time.sleep(7)

    try:
        # href 속성 값이 'https://blog.naver.com/an_wooni/' 시작되는 값을 찾음
        driver.find_element(By.XPATH, "//*[contains(@*,'loveplz.tistory.com')]").click()
        time.sleep(9)
        print(' 페이지 이동됨')
        pyautogui.moveTo(750, 550, duration = 1)
        pyautogui.click(750, 550)
        pyautogui.sleep(5)
        driver.switch_to.window(driver.window_handles[-1])
        driver.switch_to.frame(1)

        time.sleep(3)
        driver.find_element(By.CLASS_NAME, 'link_ad').click()

        time.sleep(3)
        #add_contents = driver.find_element(By.CLASS_NAME, 'link_ad')
        #add_contents.click()
        elem = driver.find_element(By.TAG_NAME, 'body')
        elem.click() # 뜻밖의 광고클릭...
        for i in range(30):
            elem.send_keys(Keys.PAGE_DOWN)
            time.sleep(0.5)
        print('     화면이동 완료')
        
    # 블로그를 못찾았을 경우 더보기 클릭하여 상세보기로 이동
    except:
        print(' 페이지 못 찾음')
        return




def DaumSearch반복하기_(search_keyword):

    # DAujm 이동하기
    str_url = 'https://search.daum.net/search?w=blog&nil_search=btn&DA=NTB&enc=utf8&q=' 
    add_query = search_keyword
    made_url = str_url + add_query
    WEB_OPENING(made_url)





#################################################################

import xlrd
book = xlrd.open_workbook('search_keyword.xls')
sheetDaum = book.sheet_by_name('Sheet1')
sheetGoogle = book.sheet_by_name('Google')
#list = sheet._cell_values  #첵셀에서 값을 가져온다
Google_nrow = sheetGoogle.nrows
Google_ncol = sheetGoogle.ncols

Daum_nrow = sheetGoogle.nrows
Daum_ncol = sheetGoogle.ncols

#print(ncol)
#print(nrow)

###################### 구분 #####################################
while True:  

    for i in range(Daum_nrow):
        ranDomNumB = random.randrange(1,Daum_nrow)
        search_keyword_Daum = sheetDaum.col_values(0)[ranDomNumB]
        print(search_keyword_Daum)
        print(f'{i}번째 실행 : {search_keyword_Daum} 시작')
        DaumSearch반복하기_(search_keyword_Daum)
        time.sleep(1)    
        print(f'{i}번째 실행 : {search_keyword_Daum} 종료')
        time.sleep(2)    



def TEMPSTOP():
    for i in range(Google_nrow):
        ranDomNumB = random.randrange(1,Google_nrow)
        search_keyword_Google = sheetGoogle.col_values(0)[ranDomNumB]
        print(search_keyword_Google)
        print(f'{i}번째 실행 : {search_keyword_Google} 시작')
        GoogleSearch반복하기(search_keyword_Google)
        time.sleep(1)    
        print(f'{i}번째 실행 : {search_keyword_Google} 종료')
        time.sleep(2)    