from selenium import webdriver
from selenium.webdriver.common.keys import Keys

driver = webdriver.Chrome(executable_path="c:/chromedriver.exe")
driver.implicitly_wait(10)
#driver.get("http://loveplz.tistory.com")
driver.get("http://www.pytone.org")

elem = driver.find_element_by_class_name("q")
elem.clear()
elem.send_keys("pycon")
elem.send_keys(Keys.RETURN)
assert "No result found." not in driver.page_source

#dirver.close()

print("pyautogui")
print("selenium")
