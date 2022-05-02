from decouple import config
import requests
from bs4 import BeautifulSoup
import pandas as pd
from multiprocessing import Pool
import re
import mysql.connector

#도서관 정보나루 Open API 인증키
API_KEY = config('API_KEY')

#데이터베이스 설정 정보
dbConfig = {
    'host' : config('DB_HOST')
    'user' : config('DB_USER'),
    'password' : config('DB_PW'),
    'database' : config('DB_NAME'),
}

#책 정보 삽입 쿼리
sql1 = '''
    INSERT INTO book
    (ISBN, bookName, authors, publisher, bookImageURL, publicationYear, classNo, loanCnt, description)
    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s)
'''

#함께 많이 대출된 책 정보 삽입 쿼리
sql2 = '''
    INSERT INTO MTLBook
    (ISBN, TL1_ISBN, TL1_loanCnt, TL2_ISBN, TL2_loanCnt, TL3_ISBN, TL3_loanCnt, TL4_ISBN, TL4_loanCnt,
    TL5_ISBN, TL5_loanCnt, TL6_ISBN, TL6_loanCnt, TL7_ISBN, TL7_loanCnt, TL8_ISBN, TL8_loanCnt,
    TL9_ISBN, TL9_loanCnt, TL10_ISBN, TL10_loanCnt, TL11_ISBN, TL11_loanCnt, TL12_ISBN, TL12_loanCnt,
    TL13_ISBN, TL13_loanCnt, TL14_ISBN, TL14_loanCnt, TL15_ISBN, TL15_loanCnt, TL16_ISBN, TL16_loanCnt,
    TL17_ISBN, TL17_loanCnt, TL18_ISBN, TL18_loanCnt, TL19_ISBN, TL19_loanCnt, TL20_ISBN, TL20_loanCnt)
    VALUES(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
'''

p = re.compile('[\t\n\r\f\v]')

#도서 정보 수집을 동대문도서관에 비치된 장서 목록을 기준으로 수행하기 위하여 ISBN 번호만 추출
df = pd.read_excel('/Users/macbook/Downloads/동대문도서관 장서 대출목록 (2020년 09월).xlsx', sheet_name='Sheet1')

isbnList = list(df['ISBN'])

conn_pool = None

def init():
    global conn_pool
    conn_pool = mysql.connector.connect(
        pool_name='mypool',
        pool_size=1,
        **dbConfig
    )

def crawler(index, isbn):
    try:
        #도서관 정보나루 Open API에서 도서의 이용 분석 정보 호출
        result1 = requests.get('http://data4library.kr/api/usageAnalysisList?authKey={0}&isbn13={1}'.format(AUTH_KEY, isbn))

        soup1 = BeautifulSoup(result1.content, 'xml')
        
        #잘못된 ISBN 번호이거나 주제 분류 번호가 없으면 수집을 중단한다
        if soup1.find('error') != None or soup1.book.class_no.text == '':
            return
        
        #도서의 기본 정보 추출
        bookName = soup1.book.bookname.text
        authors = soup1.book.authors.text
        publisher = soup1.book.publisher.text
        bookImageURL = soup1.book.bookImageURL.text
        publicationYear = soup1.book.publication_year.text
        classNo = soup1.book.class_no.text
        loanCnt = soup1.book.loanCnt.text
        recBooks = soup1.recBooks.findAll('book')
        
        #교보문고 사이트에서 도서 상세 페이지 호출
        result2 = requests.get('http://www.kyobobook.co.kr/product/detailViewKor.laf?barcode={0}'.format(isbn))

        soup2 = BeautifulSoup(result2.content, 'html.parser')
        
        #책 소개 정보 추출
        box_detail_article = soup2.find('div', {"class" : "box_detail_article"})
        
        #책 소개 정보가 존재하지 않으면 수집을 중단한다
        if box_detail_article == None:
            return
        
        description = p.sub('', box_detail_article.text)

        cursor = conn_pool.cursor()

        val1 = [isbn, bookName, authors, publisher, bookImageURL, publicationYear, classNo, loanCnt, description]
        
        #데이터베이스에 도서 정보 삽입
        cursor.execute(sql1, val1)

        val2 = [isbn, ]
        for recBook in recBooks:
            val2.append(recBook.isbn13.text)
            val2.append(recBook.loanCnt.text)

        for i in range(len(recBooks), 20):
            val2.append('NULL')
            val2.append('NULL')
        
        #데이터베이스에 도서와 함께 많이 대출된 책 정보 삽입
        cursor.execute(sql2, val2)

        conn_pool.commit()

        cursor.close()

    except Exception as e:
        print(index)
        print(e)

if __name__ == '__main__':
    with Pool(initializer=init, processes = 5) as p:
        p.starmap(crawler, enumerate(isbnList))

    
