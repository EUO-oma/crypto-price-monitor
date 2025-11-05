# -*- coding: utf-8 -*-
import pyautogui
import time
import random
from selenium import webdriver
from selenium.webdriver import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager


chrome_options = Options()
chrome_options.add_experimental_option('excludeSwitches',['enable-logging']) # 불필요한 메시지 제거

    # 헤드리스 실행하기
#chrome_options.add_argument('headless') # headless
chrome_options.add_argument('--mute-audio')
chrome_options.add_argument('disable-gpu')
chrome_options.add_argument("window-size=150x280")  # 화면크기(전체화면)
chrome_options.add_argument("disable-infobars")
chrome_options.add_argument("--disable-extensions")\
    # 브라우저 실행하기



def WEB_OPENING_ADClick(made_url):
    driver = webdriver.Chrome("chromedriver.exe", options=chrome_options)
    #driver = webdriver.Chrome(ChromeDriverManager().install(), options=chrome_options)
    driver.maximize_window()
    driver.get(made_url)
    driver.implicitly_wait(13)
    time.sleep(5)

    # 내 블로그 찾기
    try:
        # href 속성 값이 'https://blog.naver.com/an_wooni/' 시작되는 값을 찾음
        driver.find_element(By.XPATH, "//*[contains(@*,'loveplz.tistory.com')]").click()
        time.sleep(5)
        print(' 페이지 이동됨')
        driver.switch_to.window(driver.window_handles[-1])
        driver.switch_to.frame(1)
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



def WEB_OPENING_ADNOClick(made_url):
    driver = webdriver.Chrome("chromedriver.exe", options=chrome_options)
    driver.maximize_window()
    driver.get(made_url)
    driver.implicitly_wait(13)
    time.sleep(5)

    # 내 블로그 찾기
    try:
        # href 속성 값이 'https://blog.naver.com/an_wooni/' 시작되는 값을 찾음
        driver.find_element(By.XPATH, "//*[contains(@*,'loveplz.tistory.com')]").click()
        time.sleep(5)
        print(' 페이지 이동됨')
        driver.switch_to.window(driver.window_handles[-1])
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



def GoogleSearch반복하기(search_keyword):

    # 네이버로 이동하기
    str_url = 'https://www.google.com/search?q=' 
    add_query = search_keyword
    made_url = str_url + add_query

    WEB_OPENING_ADNOClick(made_url)
    






def DaumSearch반복하기_(search_keyword):

    # DAujm 이동하기
    str_url = 'https://search.daum.net/search?w=blog&nil_search=btn&DA=NTB&enc=utf8&q=' 
    add_query = search_keyword
    made_url = str_url + add_query
    
    WEB_OPENING_ADNOClick(made_url)





#################################################################

import xlrd
book = xlrd.open_workbook('search_keyword.xls')
sheetDaum = book.sheet_by_name('Sheet1')
sheetGoogle = book.sheet_by_name('Google')

Google_nrow = sheetGoogle.nrows
Google_ncol = sheetGoogle.ncols

Daum_nrow = sheetGoogle.nrows
Daum_ncol = sheetGoogle.ncols


###################### 구분 #####################################
while True:  
    ###################################################

    for i in range(Daum_nrow):
        ranDomNumB = random.randrange(1,Daum_nrow)
        search_keyword_Daum = sheetDaum.col_values(0)[ranDomNumB]
        print(search_keyword_Daum)
        print(f'{i}번째 실행 : {search_keyword_Daum} 시작')
        DaumSearch반복하기_(search_keyword_Daum)
        time.sleep(1)    
        print(f'{i}번째 실행 : {search_keyword_Daum} 종료')
        time.sleep(2)    



    for i in range(Google_nrow):
        ranDomNumB = random.randrange(1,Google_nrow)
        search_keyword_Google = sheetGoogle.col_values(0)[ranDomNumB]
        print(search_keyword_Google)
        print(f'{i}번째 실행 : {search_keyword_Google} 시작')
        GoogleSearch반복하기(search_keyword_Google)
        time.sleep(1)    
        print(f'{i}번째 실행 : {search_keyword_Google} 종료')
        time.sleep(2)    