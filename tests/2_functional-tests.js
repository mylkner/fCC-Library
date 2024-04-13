/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const expect = chai.expect;

chai.use(chaiHttp);

suite("Functional Tests", function () {
    /*
     * ----[EXAMPLE TEST]----
     * Each test should completely test the response of the API end-point including response status code!
     */
    test("#example Test GET /api/books", function (done) {
        chai.request(server)
            .get("/api/books")
            .end(function (err, res) {
                assert.equal(res.status, 200);
                assert.isArray(res.body, "response should be an array");
                assert.property(
                    res.body[0],
                    "commentcount",
                    "Books in array should contain commentcount"
                );
                assert.property(
                    res.body[0],
                    "title",
                    "Books in array should contain title"
                );
                assert.property(
                    res.body[0],
                    "_id",
                    "Books in array should contain _id"
                );
                done();
            });
    });
    /*
     * ----[END of EXAMPLE TEST]----
     */

    suite("Routing tests", function () {
        this.timeout(0);

        let testId;

        suite(
            "POST /api/books with title => create book object/expect book object",
            function () {
                test("Test POST /api/books with title", function (done) {
                    chai.request(server)
                        .post("/api/books")
                        .send({ title: "test" })
                        .end((req, res) => {
                            assert.equal(res.status, 200);
                            expect(res.body).to.have.property("_id");
                            expect(res.body)
                                .to.have.property("title")
                                .to.equal("test");
                            testId = res.body._id;
                            done();
                        });
                });

                test("Test POST /api/books with no title given", function (done) {
                    chai.request(server)
                        .post("/api/books")
                        .send({ title: "" })
                        .end((req, res) => {
                            assert.equal(res.status, 200);
                            assert.strictEqual(
                                res.body,
                                "missing required field title"
                            );
                            done();
                        });
                });
            }
        );

        suite("GET /api/books => array of books", function () {
            test("Test GET /api/books", function (done) {
                chai.request(server)
                    .get("/api/books")
                    .end((req, res) => {
                        assert.equal(res.status, 200);
                        assert.isArray(res.body, "res should be array");
                        expect(res.body[0]).to.have.property("_id");
                        expect(res.body[0]).to.have.property("title");
                        expect(res.body[0]).to.have.property("comments");
                        expect(res.body[0]).to.have.property("commentcount");
                        done();
                    });
            });
        });

        suite("GET /api/books/[id] => book object with [id]", function () {
            test("Test GET /api/books/[id] with id not in db", function (done) {
                chai.request(server)
                    .get("/api/books/invalid_id")
                    .end((req, res) => {
                        assert.equal(res.status, 200);
                        assert.strictEqual(res.body, "no book exists");
                        done();
                    });
            });

            test("Test GET /api/books/[id] with valid id in db", function (done) {
                chai.request(server)
                    .get("/api/books/" + testId)
                    .end((req, res) => {
                        assert.equal(res.status, 200);
                        expect(res.body)
                            .to.have.property("_id")
                            .to.equal(testId);
                        expect(res.body)
                            .to.have.property("title")
                            .to.equal("test");
                        expect(res.body).to.have.property("comments");
                        done();
                    });
            });
        });

        suite(
            "POST /api/books/[id] => add comment/expect book object with id",
            function () {
                test("Test POST /api/books/[id] with comment", function (done) {
                    chai.request(server)
                        .post("/api/books/" + testId)
                        .send({ id: testId, comment: "test" })
                        .end((req, res) => {
                            assert.equal(res.status, 200);
                            expect(res.body)
                                .to.have.property("_id")
                                .to.equal(testId);
                            expect(res.body)
                                .to.have.property("title")
                                .to.equal("test");
                            expect(res.body).to.have.property("comments");
                            expect(res.body.comments[0]).to.equal("test");
                            done();
                        });
                });

                test("Test POST /api/books/[id] without comment field", function (done) {
                    chai.request(server)
                        .post("/api/books/" + testId)
                        .send({ id: testId, comment: "" })
                        .end((req, res) => {
                            assert.equal(res.status, 200);
                            assert.strictEqual(
                                res.body,
                                "missing required field comment"
                            );
                            done();
                        });
                });

                test("Test POST /api/books/[id] with comment, id not in db", function (done) {
                    chai.request(server)
                        .post("/api/books/invalid_id")
                        .send({ id: "invalid_id", comment: "invalid" })
                        .end((req, res) => {
                            assert.equal(res.status, 200);
                            assert.strictEqual(res.body, "no book exists");
                            done();
                        });
                });
            }
        );

        suite("DELETE /api/books/[id] => delete book object id", function () {
            test("Test DELETE /api/books/[id] with valid id in db", function (done) {
                chai.request(server)
                    .delete("/api/books/" + testId)
                    .end((req, res) => {
                        assert.equal(res.status, 200);
                        assert.strictEqual(res.body, "delete successful");
                        done();
                    });
            });

            test("Test DELETE /api/books/[id] with  id not in db", function (done) {
                chai.request(server)
                    .delete("/api/books/invalid_id")
                    .end((req, res) => {
                        assert.equal(res.status, 200);
                        assert.strictEqual(res.body, "no book exists");
                        done();
                    });
            });
        });
    });
});
