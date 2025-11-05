
# from libs.naver_shopping.crawler import crawl
# from libs.naver_shopping.parser import parse

import xlrd

book = xlrd.open_workbook('site_list_to_open.xls')
sheet = book.sheet_by_name('Sheet1')
list = sheet._cell_values  #첵셀에서 값을 가져온다

result=[]
for row in list[1:]:
    keyword = row[0]
    result.append(keyword)
    
print(result)

