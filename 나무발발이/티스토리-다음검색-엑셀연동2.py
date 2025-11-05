# -*- coding: utf-8 -*-
import time

from selenium import webdriver
from selenium.webdriver import Keys
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By


chrome_options = Options()
    # 헤드리스 실행하기
chrome_options.add_argument('headless') # headless
chrome_options.add_argument('--mute-audio')
chrome_options.add_argument('disable-gpu')
chrome_options.add_argument("window-size=150x280")  # 화면크기(전체화면)
chrome_options.add_argument("disable-infobars")
chrome_options.add_argument("--disable-extensions")\
    # 브라우저 실행하기



# 크롬 드라이버 다운받기
# https://chromedriver.chromium.org/downloads

def 다음블로그반복하기(search_keyword):

    # 네이버로 이동하기
    str_url = 'https://search.daum.net/search?w=blog&nil_search=btn&DA=NTB&enc=utf8&q=' 
    add_query = search_keyword
    made_url = str_url + add_query

    driver = webdriver.Chrome("chromedriver.exe", options=chrome_options)
    driver.maximize_window()
    driver.implicitly_wait(10)
    driver.get(made_url)

    time.sleep(3)

    # 내 블로그 찾기
    try:
        # href 속성 값이 'https://blog.naver.com/an_wooni/' 시작되는 값을 찾음
        driver.find_element(By.XPATH, "//*[contains(@*,'loveplz.tistory.com')]").click()
        time.sleep(2)
        print(' 페이지 이동됨')
    # 블로그를 못찾았을 경우 더보기 클릭하여 상세보기로 이동
    except:
        print(' 페이지 못 찾음')
        return
        # return

    # 스크롤 다운
    driver.switch_to.window(driver.window_handles[-1])
    elem = driver.find_element(By.TAG_NAME, 'body')
    elem.click() # 뜻밖의 광고클릭...
    time.sleep(3)
    driver.switch_to.window(driver.window_handles[+1])
    #driver.close() ## 방금 열린 광고창 닫기

    #elem = driver.find_element(By.CLASS_NAME, 'search_on')
    #elem.click() # 
    time.sleep(0.5)

    for i in range(20):
        elem.send_keys(Keys.PAGE_DOWN)
        time.sleep(0.3)

    print('     화면이동 완료')







def 다음블로그반복하기_광고안클릭(search_keyword):

    # 네이버로 이동하기
    str_url = 'https://search.daum.net/search?w=blog&nil_search=btn&DA=NTB&enc=utf8&q=' 
    add_query = search_keyword
    made_url = str_url + add_query
    
    driver = webdriver.Chrome("chromedriver.exe", options=chrome_options)
    driver.maximize_window()
    driver.get(made_url)
    driver.implicitly_wait(10)
    time.sleep(2)

    # 내 블로그 찾기
    try:
        # href 속성 값이 'https://blog.naver.com/an_wooni/' 시작되는 값을 찾음
        driver.find_element(By.XPATH, "//*[contains(@*,'loveplz.tistory.com')]").click()
        time.sleep(2)
        print(' 페이지 이동됨')
    # 블로그를 못찾았을 경우 더보기 클릭하여 상세보기로 이동
    except:
        print(' 페이지 못 찾음')
        return

    driver.switch_to.window(driver.window_handles[-1])
    time.sleep(0.5)

    for i in range(10):
        elem.send_keys(Keys.PAGE_DOWN)
        time.sleep(0.5)
    print('     화면이동 완료')



#################################################################

import xlrd
book = xlrd.open_workbook('search_keyword.xls')
sheet = book.sheet_by_name('Sheet1')
#list = sheet._cell_values  #첵셀에서 값을 가져온다
nrow = sheet.nrows
ncol = sheet.ncols

print(ncol)
print(nrow)

###################### 구분 #####################################

for i in range(nrow):
    search_keyword = sheet.col_values(0)[i]
    print(search_keyword)
    print(f'{i}번째 실행 : {search_keyword} 시작')
    다음블로그반복하기(search_keyword)
    time.sleep(1)    
    print(f'{i}번째 실행 : {search_keyword} 종료')
    time.sleep(1)    

###################################################
for i in range(100):
    for i in range(nrow):
        search_keyword = sheet.col_values(0)[i]
        print(search_keyword)
        print(f'{i}번째 실행 : {search_keyword} 시작')
        다음블로그반복하기_광고안클릭(search_keyword)
        time.sleep(1)    
        print(f'{i}번째 실행 : {search_keyword} 종료')
        time.sleep(1)    

