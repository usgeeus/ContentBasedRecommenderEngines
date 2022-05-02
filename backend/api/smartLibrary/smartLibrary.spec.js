const request = require('supertest');
const should = require('should');
const app = require('../../');

describe("GET /smtLibrs는 ", () => {
    describe("성공시 ", () => {
        it("페이지네이션 정보와 스마트도서관 객체 배열을 반환한다 ", (done) => {
            request(app)
                .get("/smtLibrs")
                .end((err, res) => {
                    res.body.should.have.properties([
                        'totalItems', //스마트도서관 객체의 전체 갯수
                        'items', //스마트도서관 객체를 담은 배열
                        'totalPages', //전체 페이지 갯수
                        'currentPage', //현재 페이지 번호
                    ]);
                    done();
                });
        });

        it("page번째 페이지에 있는 스마트도서관 객체를 최대 limit 갯수만큼 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs?page=3&limit=10')
                .end((err, res) => {
                    res.body.should.have.ownProperty('currentPage').equal(3);
                    res.body.should.have.ownProperty('items').lengthOf(10);
                    done();
                });
        });

        it("limit 값이 50보다 크다면 스마트도서관 객체를 50개만 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs?limit=9999')
                .end((err, res) => {
                    res.body.should.have.ownProperty('items').lengthOf(50);
                    done();
                })
        });
    });

    describe("실패시 ", () => {
        it("limit가 숫자형이 아니면 400을 응답한다 ", (done) => {
            request(app)
                .get("/smtLibrs?limit=ten")
                .expect(400)
                .end(done);
        });

        it("page가 숫자형이 아니면 400을 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs?page=one')
                .expect(400)
                .end(done);
        })
    });
});

describe("GET /smtLibrs/:smtLibryId는 ", () => {
    describe("성공시 ", () => {
        it("smtLibryId가 1인 스마트도서관 객체를 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1')
                .end((err, res) => {
                    res.body.should.have.property('id', 1);
                    res.body.should.have.properties([
                        'name',
                        'region',
                        'Region.name',
                        'latitude',
                        'longitude',
                        'maxNumOfBooks',
                    ]);

                    done();
                });
        });

        it("analysisInfoYN이 Y이면 스마트도서관 객체와 함께 스마트도서관에 비치된 도서들의 주제 분류별 갯수를 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1?analysisInfoYN=Y')
                .end((err, res) => {
                    res.body.should.have.property('analysisInfo');

                    done();
                });
        });

    });

    describe("실패시 ", () => {
        it("smtLibryId가 숫자가 아닐 경우 400을 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs/one')
                .expect(400)
                .end(done);
        });

        it("analysisInfoYN이 Y와 N 둘 다 아닐 경우 400을 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1?analysisInfoYN=OK')
                .expect(400)
                .end(done);
        });

        it("smtLibryId에 해당하는 스마트도서관이 존재하지 않는 경우 404를 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs/9999')
                .expect(404)
                .end(done);
        });
    });
});

describe("GET /smtLibrs/:smtLibryId/books는 ", () => {
    describe("성공시 ", () => {
        it("smtLibryId가 1인 스마트도서관에 비치되어 있는 도서 객체 배열과 페이지네이션 정보를 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books')
                .end((err, res) => {
                    res.body.should.have.properties([
                        'totalItems', //스마트도서관에 비치된 도서의 총 갯수
                        'items', //스마트도서관에 비치된 도서 객체를 담은 배열
                        'totalPages', //전체 페이지 갯수
                        'currentPage', //현재 페이지 번호
                    ]);
                    done();
                });
        });

        it("page번째 페이지에 있는 스마트도서관에 비치되어 있는 도서 객체를 최대 limit 갯수만큼 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books?page=3&limit=10')
                .end((err, res) => {
                    res.body.should.have.ownProperty('currentPage').equal(3);
                    res.body.should.have.ownProperty('items').lengthOf(10);
                    done();
                });
        });

        it("limit 값이 50보다 크다면 스마트도서관에 비치되어 있는 도서 객체를 50개만 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books?limit=9999')
                .end((err, res) => {
                    res.body.should.have.ownProperty('items').lengthOf(50);
                    done();
                })
        });
    });

    describe("실패시 ", () => {
        it("smtLibryId가 숫자형이 아닌 경우 400을 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs/one/books')
                .expect(400)
                .end(done);
        });

        it("limit가 숫자형이 아닌 경우 400을 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books?limit=ten')
                .expect(400)
                .end(done);
        });

        it("page가 숫자형이 아닌 경우 400을 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books/?page=one')
                .expect(400)
                .end(done);
        });

        it("smtLibryId에 해당하는 스마트도서관이 존재하지 않을 경우 404를 응답한다 ", (done) => {
            request(app)
                .get('/smtLibrs/9999/books')
                .expect(404)
                .end(done);
        });

        it("sort_by가 존재하지 않는 칼럼 명 인 경우 400을 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books?sort_by=abcdefg')
                .expect(400)
                .end(done);
        });

        it("order_by가 오름차순(ASC)과 내림차순(DESC) 둘 다 아닌 경우 400을 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books?sort_by=id&order_by=INTERVAL')
                .expect(400)
                .end(done);
        });
    });
});

describe("GET /smtLibrs/:smtLibryId/books/:smtLibryBookId는 ", () => {
    describe("성공시 ", () => {
        it("smtLibryId가 1인 스마트도서관에 비치되어 있는 smtLibryBookId가 1인 도서 상세 정보 객체를 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books/1')
                .end((err, res) => {
                    res.body.should.have.properties([
                        'id',
                        'placedAt',
                        'lastLoanedAt',
                        'loanCnt',
                        'status',
                        'bookInfo',
                        'loanHistories',
                        'reLibrary',
                        'smLibrary',
                    ]);
                });
        });
    });

    describe("실패시 ", () => {
        it("smtLibryId가 숫자형이 아니면 400을 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/one/books/1')
                .expect(400)
                .end(done);
        });

        it("smtLibryBookId가 숫자형이 아니면 400을 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books/one')
                .expect(400)
                .end(done);
        });

        it("smtLibryId에 해당하는 스마트도서관이 존재하지 않는 경우 404를 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/9999/books/1')
                .expect(404)
                .end(done);
        });

        it("smtLibryId에 해당하는 스마트도서관에 smtLibryBookId에 해당하는 도서가 존재하지 않는 경우 404를 반환한다 ", (done) => {
            request(app)
                .get('/smtLibrs/1/books/9999')
                .expect(404)
                .end(done);
        });
    });
});

