const request = require('supertest');
const should = require('should');
const app = require('../../');

describe('GET /bookReservs 는 ', () => {
    describe('성공시 ', () => {
        it('페이지네이션 정보와 전체 스마트도서관의 미완료 상태인 도서예약 객체 배열을 반환한다 ', (done) => {
            request(app)
                .get('/bookReservs')
                .end((err, res) => {
                    
                    res.body.should.have.properties([
                        'totalItems', //도서예약 객체의 전체 갯수
                        'items', //도서예약 객체를 담은 배열
                        'totalPages', //전체 페이지 갯수
                        'currentPage', //현재 페이지 번호
                    ]);
                    done();
                });
        });

        it('page번째 페이지에 있는 미완료 상태인 도서예약 객체를 최대 limit 갯수만큼 반환한다 ', (done) => {
            request(app)
                .get('/bookReservs?page=3&limit=10')
                .end((err, res) => {
                    res.body.should.have.ownProperty('currentPage').equal(3);
                    res.body.should.have.ownProperty('items').lengthOf(10);
                    done();
                });
        });

        it('limit 값이 50보다 크다면 미완료 상태인 도서예약 객체를 50개만 반환한다', (done) => {
            request(app)
                .get('/bookReservs?limit=9999')
                .end((err, res) => {
                    res.body.should.have.ownProperty('items').lengthOf(50);
                    done();
                })
        });

    });

    describe('실패시 ', () => {
        it("limit가 숫자형이 아니면 400을 응답한다 ", (done) => {
            request(app)
                .get("/bookReservs?limit=ten")
                .expect(400)
                .end(done);
        });

        it('page가 숫자형이 아니면 400을 응답한다 ', (done) => {
            request(app)
                .get('/bookReservs?page=one')
                .expect(400)
                .end(done);
        })
    });
});

describe('GET /bookReservs/:bookReservationId는 ', () => {
    describe('성공시 ', () => {
        it('bookReservationId에 해당하는 예약 대출 신청 정보와 예약 대출 신청된 도서의 상세 정보 객체 배열을 반환한다 ', (done) => {
            request(app)
                .get('/bookReservs/4')
                .end((err, res) => {
                    res.body.should.have.properties([
                        'id',
                        'status',
                        'createdAt',
                        'updatedAt',
                        'User',
                        'SmLibrary',
                        'ReservedBooks',
                    ]);
                    res.body.should.have.property('ReservedBooks').instanceOf(Array);
                    done();
                });
        });
    });

    describe('실패시 ', () => {
        it('bookReservationId가 숫자형이 아닌 경우 400을 반환한다 ', (done) => {
            request(app)
                .get('/bookReservs/four')
                .expect(400)
                .end(done);
        });

        it('bookReservationId에 해당하는 예약 대출 신청이 존재하지 않는 경우 404를 반환한다 ', (done) => {
            request(app)
                .get('/bookReservs/9999')
                .expect(404)
                .end(done);
        });
    });
});

describe('PUT /bookReservs/:bookReservationId는', () => {
    describe('성공시 ', () =>{
        it('status가 1로 수정된 bookReservationId에 해당하는 예약 대출 신청 정보 객체를 반환한다 ', (done) => {
            request(app)
                .put('/bookReservs/4')
                .send({ status: 1 })
                .expect(201)
                .then((res) => {
                    res.body.should.have.property('status', 1);
                });
                done();
        });
    });

    describe('실패시 ', () => {
        it('bookReservationId가 숫자형이 아닌 경우 400을 반환한다 ', (done) => {
            request(app)
                .put('/bookReservs/four')
                .send({ status: 1 })
                .expect(400)
                .end(done);
        });

        it('bookReservationId에 해당하는 예약 대출 신청이 존재하지 않는 경우 404를 반환한다 ', (done) => {
            request(app)
                .put('/bookReservs/9999')
                .send({ status: 1 })
                .expect(404)
                .end(done);
        });

        it('status를 보내지 않았을 경우 400을 반환한다  ', (done) => {
            request(app)
                .put('/bookReservs/4')
                .expect(400)
                .end(done);
        });

        it('status가 숫자형이 아닐 경우 400을 반환한다 ', (done) => {
            request(app)
                .put('/bookReservs/4')
                .send({ status: 'one'})
                .expect(400)
                .end(done);
        });

        it('status에 해당하는 상태 코드가 존재하지 않는 경우 400을 반환한다 ', (done) => {
            request(app)
                .put('/bookReservs/4')
                .send({ status: 9999 })
                .expect(400)
                .end(done);
        });
    });
});