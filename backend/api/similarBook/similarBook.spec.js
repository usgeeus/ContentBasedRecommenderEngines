const request = require('supertest');
const should = require('should');
const app = require('../../');

describe('GET /simBooks/:ISBN 은 ', () => {
    describe('성공시 ', () => {
        it('ISBN에 해당하는 도서 정보 객체와 그 도서와 유사도가 높은 도서들의 정보 객체 배열을 반환한다 ', (done) => {
            request(app)
                .get('/simBooks/9788993499599')
                .expect(200)
                .then((res) => {
                    res.body.should.have.properties([
                        'ISBN',
                        'bookName',
                        'autors',
                        'publisher',
                        'bookImageURL',
                        'publicationYear',
                        'classNo',
                        'loanCnt',
                        'description',
                        'similarBooks'
                    ]);
                    res.body.shoud.have.property('similarBooks').instanceOf(Array);
                    done();
                });
        });
        
        it('도서와 유사도가 높은 도서 정보를 limit 갯수 만큼 반환한다 ', (done) => {
            request(app)
            .get('/simBooks/9788993499599?limit=20')
            .expect(200)
            .then((res) => {
                res.body.should.have.property('similarBooks').length(20);
                done();
            });
        });
    });
    describe('실패시 ', () => {
        it('ISBN가 숫자형이 아닌 경우 400을 반환한다 ', (done) => {
            request(app)
                .get('/simBooks/nineeightsevensixfivefourthreetwoonezero')
                .expect(400)
                .end(done);
        });

        it('ISBN에 해당하는 도서 정보가 존재하지 않을 경우 404를 반환한다 ', (done) => {
            request(app)
                .get('/simBooks/9999999999999')
                .expect(404)
                .end(done);
        });
    });
});