import time
import random
import xlrd

from selenium import webdriver

from webdriver_manager.chrome import ChromeDriverManager

from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

def set_chrome_driver():
    chrome_options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    return driver


def Find_My_Site(made_url):
    #1
    driver = set_chrome_driver()
   # driver.maximize_window()
    driver.get(made_url)
    driver.implicitly_wait(13)
    try:
        driver.find_element(By.XPATH, "//*[contains(@*,'loveplz.tistory.com')]").click()
        driver.switch_to.window(driver.window_handles[-1])
        driver.switch_to.frame(0)

        driver.find_element(By.CLASS_NAME, 'link_ad').click()

        for i in range(5):
            driver.execute_script("window.scrollBy(0, 1000);")
            time.sleep(0.5)
        print('Page moved successfully')

    except:
        print('Page not found')
        return

def GoogleSearch반복하기(search_keyword):

    # go to google
    str_url = 'https://www.google.com/search?q=' 
    add_query = search_keyword
    made_url = str_url + add_query

    Find_My_Site(made_url)

def DaumSearch반복하기_(search_keyword):

    # go to Daum
    str_url = 'https://search.daum.net/search?w=blog&nil_search=btn&DA=NTB&enc=utf8&q=' 
    add_query = search_keyword
    made_url = str_url + add_query
    
    Find_My_Site(made_url)


book = xlrd.open_workbook('search_keyword.xls')
sheetDaum = book.sheet_by_name('Sheet1')
sheetGoogle = book.sheet_by_name('Google')

Google_nrow = sheetGoogle.nrows
Google_ncol = sheetGoogle.ncols
Daum_nrow = sheetDaum.nrows
Daum_ncol = sheetDaum.ncols

# Set the number of iterations
iterations = 10

for i in range(iterations):
    # Choose a random keyword from the Daum sheet
    ranDomNumB = random.randrange(1, Daum_nrow)
    search_keyword_Daum = sheetDaum.col_values(0)[ranDomNumB]
    print(search_keyword_Daum) 
    print(f'{i}번째 실행 : {search_keyword_Daum} 시작')
    DaumSearch반복하기_(search_keyword_Daum)
    print(f'{i}번째 실행 : {search_keyword_Daum} 종료')

    # Choose a random keyword from the Google sheet
    ranDomNumB = random.randrange(1, Google_nrow)
    search_keyword_Google = sheetGoogle.col_values(0)[ranDomNumB]
    print(search_keyword_Google)
    print(f'{i}번째 실행 : {search_keyword_Google} 시작')
    GoogleSearch반복하기(search_keyword_Google)
    print(f'{i}번째 실행 : {search_keyword_Google} 종료')
    time.sleep(2)

