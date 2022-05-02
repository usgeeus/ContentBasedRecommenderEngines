import requests
import mysql.connector
import re
from decouple import config
from random import randint
from datetime import date, datetime, timedelta

#실제로 스마트도서관에 비치된 도서 정보는 공개되어 있지 않아서 임의로 스마트도서관에 비치된 도서 정보를 생성하였다

#데이터베이스 설정 정보
dbConfig = {
    'host' : config('DB_HOST')
    'user' : config('DB_USER'),
    'password' : config('DB_PW'),
    'database' : config('DB_NAME'),
}

#스마트도서관에 비치된 책 정보 삽입 쿼리
sql = '''INSERT INTO SmLibraryBooks (ISBN, reLibraryId, smtLibraryId, placedAt, lastLoanedAt, loanCnt)
    VALUES (%s, %s, %s, %s, %s, %s)'''

cnx = mysql.connector.connect(**dbConfig)

cursor = cnx.cursor()

#데이터베이스에서 스마트도서관 정보 추출
cursor1.execute("SELECT id, name, region, maxNumOfBooks FROM SmLibraries")

smLibraries = cursor1.fetchall()

cursor2 = cnx.cursor()

#데이터베이스에서 도서 정보 추출
cursor2.execute("SELECT ISBN FROM Books WHERE loanCnt > 5000")

books = cursor2.fetchall()

for id, name, region, maxNumOfBooks in smLibraries:
    #만들어낼 도서의 권수 설정
    numOfBooks = maxNumOfBooks - randint(0, 15)
    
    for i in range(numOfBooks):
        #데이터베이스에 있는 도서들 중에서 임의로 한 권을 선택
        ISBN = books[randint(0, len(books)-1)][0]
        
        cursor3 = cnx.cursor()
        
        #스마트도서관이 위치한 자치구의 코드를 통해서 해당 자치구에 위치한 공공도서관 정보를 추출
        cursor3.execute("SELECT id FROM ReLibraries WHERE region = {0}".format(region))
        
        ReLibrariesList = cursor3.fetchall()
        
        #스마트도서관과 같은 자치구에 있는 공공도서관 중에서 임의로 한 곳을 선택
        reLibraryId = ReLibrariesList[randint(0, len(ReLibrariesList)-1)][0]
        
        placedAt = None
        lastLoanedAt = None
        
        #책이 비치된 날짜와 마지막으로 대출된 날짜를 임의로 선택
        while(True):
            global placedAt, lastLoanedAt
            
            placedAt = date(2020, 12, 1) - timedelta(days=randint(0, 30))
            lastLoanedAt = placedAt + timedelta(days=randint(0, 30))
            
            if date(2020, 12, 1) - lastLoanedAt > timedelta(days=0) :
                break
        
        #책이 대출된 횟수를 임의로 선택
        loanCnt = randint(0, 5)
        
        cursor4 = cnx.cursor()
        
        #데이터베이스에 스마트도서관에 비치된 책 정보를 삽입
        cursor4.execute(sql2, (ISBN, reLibraryId, id, placedAt, lastLoanedAt, loanCnt))

cnx.commit();