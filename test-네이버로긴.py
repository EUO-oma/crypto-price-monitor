
import pyautogui
import pyperclip
import time
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

# 출처: https://private.tistory.com/119 [공부해서 남 주자]

##사용할 변수 선언 #네이버 로그인 주소
url = 'https://nid.naver.com/nidlogin.login?mode=form&url=https%3A%2F%2Fwww.naver.com' 
uid = 'abundant255' 
upw = 'dain0424!@'


#driver 변수 선언 
driver = webdriver.Chrome('C:\chromedriver.exe')
driver.maximize_window()
driver.implicitly_wait(10)
driver.get('https://nid.naver.com/nidlogin.login?mode=form&url=https%3A%2F%2Fwww.naver.com')


#아이디 ,패스워드 입력폼 
tag_id = driver.find_element_by_name('id') 
tag_pw = driver.find_element_by_name('pw')

login_btn = driver.find_element_by_id('log.login') 



time.sleep(2)
tag_id.click()
pyperclip.copy(uid) # 클립보드에 텍스트를 복사합니다. 
pyautogui.hotkey('ctrl', 'v') # 붙여넣기 (hotkey 설명은 아래에 있습니다.)

time.sleep(2)
tag_pw.click()
pyperclip.copy(upw) # 클립보드에 텍스트를 복사합니다. 
pyautogui.hotkey('ctrl', 'v') # 붙여넣기 (hotkey 설명은 아래에 있습니다.)

time.sleep(2)
login_btn.click()
time.sleep(5)

#출처: https://private.tistory.com/119 


driver.get("https://mail.naver.com/")
#get("https://mail.naver.com/")










#driver.get('https://google.com')
#단일 element에 접근
driver.find_element_by_name('name')
driver.find_element_by_id('id')
driver.find_element_by_xpath('/html/body/xpath')
#여러 elements에 접근
driver.find_element_by_css_selector('#id > input.class')
driver.find_element_by_class_name('class_name')
driver.find_element_by_tag_name('h3')