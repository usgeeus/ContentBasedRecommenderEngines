import requests
import mysql.connector
import re
from bs4 import BeautifulSoup as bs
from decouple import config

#도서관 정보나루 Open API 인증키
API_KEY = config('API_KEY')

#데이터베이스 설정 정보
dbConfig = {
    'host' : config('DB_HOST')
    'user' : config('DB_USER'),
    'password' : config('DB_PW'),
    'database' : config('DB_NAME'),
}

#공공 도서관 정보 삽입 쿼리
sql = '''INSERT INTO ReLibraries (name, code, region, latitude, longitude) VALUES (%s, %s, %s, %s, %s)'''

cnx = mysql.connector.connect(**dbConfig)

cursor = cnx.cursor()

#데이터베이스에 미리 저장해둔 서울시 자치구 정보 호출
cursor.execute("SELECT * FROM Regions")

#서울시 자치구의 id와 이름 추출
regions = []
for id, name in cursor.fetchall():
    regions.append({'id': id, 'name': name})

for i in range(1, 12):
    #도서관 정보나루 Open API에서 도서관 정보 호출
    response = requests.get('http://data4library.kr/api/libSrch?authKey={0}&pageSize=100&pageNo={1}'.format(API_KEY, i))
    
    soup = bs(response.content, 'xml')
    
    libs = soup.response.libs
    
    for lib in libs:
        #서울시에 위치한 도서관인 지 체크
        if re.search('서울', lib.address.text) == None:
            continue
            
        regionCode = 0
            
        #서울에 어떤 자치구에 위치한 도서관인 지 체크
        for region in regions:
            if re.search(region['name'], lib.address.text) != None:
                regionCode = region['id']
                    
                break
            
        #도서관 주소에서 자치구 정보를 찾을 수 없다면 수집을 중단한다        
        if regionCode == 0:   
            continue
        
        #공공도서관 정보 추출
        libName = lib.libName.text
        libCode = lib.libCode.text
        latitude = lib.latitude.text
        longitude = lib.longitude.text
            
            
        val = (libName, libCode, regionCode, latitude, longitude)
        
        #데이터베이스에 공공도서관 정보 삽입
        cursor.execute(sql, val)
            
        cnx.commit()