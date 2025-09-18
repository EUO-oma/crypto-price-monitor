from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import pandas as pd
import time

def crawl_multiple_sites(sites_list):
    # ChromeDriver 경로 설정 (다운로드한 경로로 수정)
    driver_path = r"C:\path\to\chromedriver.exe"
    driver = webdriver.Chrome(executable_path=driver_path)
    results = []

    try:
        for site in sites_list:
            print(f"Visiting site: {site}")
            driver.get(site)

            try:
                title = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "h1"))
                ).text
                results.append({
                    "사이트": site,
                    "제목": title
                })
            except Exception as e:
                print(f"Error on site {site}: {e}")
                results.append({
                    "사이트": site,
                    "제목": "제목을 찾을 수 없음"
                })

    finally:
        driver.quit()

    filename = f"크롤링_결과_{time.strftime('%Y%m%d_%H%M%S')}.xlsx"
    df = pd.DataFrame(results)
    df.to_excel(filename, index=False)
    print(f"Results saved to {filename}")

# 크롤링할 사이트 목록
sites = [
    "https://loveplz.tistory.com",
    "https://example2.com",
    "https://example3.com"
]

crawl_multiple_sites(sites)
