/* 
    Test the GET /search end point 
*/
const chai = require('chai')
const chaiHttp = require('chai-http')

const expect = chai.expect
chai.use(chaiHttp)

const path = require('path')
const filename = path.basename(__filename)

const good_user_data = require('./data/good_user_data.json')

const SERVER_URL = 'http://localhost:3333'

let SESSION_TOKEN_USER1 = ''
let SESSION_TOKEN_USER2 = ''


describe("Log into account.", () => {

    before(() => {
        console.log("[Script: " + filename + "]")
    })

    it("Should return 200, and JSON with user_id and session_token", () => {
        return chai.request(SERVER_URL)
            .post("/login")
            .send({
                "email": good_user_data[0].email,
                "password": good_user_data[0].password
                })
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json
                expect(res.body).to.have.property("user_id")
                expect(res.body).to.have.property("session_token")
                SESSION_TOKEN_USER1 = res.body.session_token
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, and JSON with user_id and session_token", () => {
        return chai.request(SERVER_URL)
            .post("/login")
            .send({
                "email": good_user_data[1].email,
                "password": good_user_data[1].password
                })
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json
                expect(res.body).to.have.property("user_id")
                expect(res.body).to.have.property("session_token")
                SESSION_TOKEN_USER2 = res.body.session_token
            })
            .catch((err) => {
                throw err
            })
    })
})

describe("Searching with no criteria, and no authentication, to test pagination.", () => {
    it("Should return 200, with an array of 10 objects", () => {
        return chai.request(SERVER_URL)
            .get("/search")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(10)

                expect(res.body[0]).to.have.property("item_id")
                expect(res.body[0]).to.have.property("name")
                expect(res.body[0]).to.have.property("description")
                expect(res.body[0]).to.have.property("end_date")
                expect(res.body[0]).to.have.property("creator_id")
                expect(res.body[0]).to.have.property("first_name")
                expect(res.body[0]).to.have.property("last_name")
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with an array of 9 objects when offsetting by 1", () => {
        return chai.request(SERVER_URL)
            .get("/search?offset=1")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(9)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with an array of 8 objects when offsetting by 2", () => {
        return chai.request(SERVER_URL)
            .get("/search?offset=2")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(8)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with an array of 5 objects when limiting to 5", () => {
        return chai.request(SERVER_URL)
            .get("/search?limit=5")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(5)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with an array of 0 objects when limiting to 5 and offsetting by 10", () => {
        return chai.request(SERVER_URL)
            .get("/search?limit=5&offset=10")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
            .catch((err) => {
                throw err
            })
    })
})


describe("Searching by status", () => {
    it("Should return 400 if status is not recognised", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=HELLO")
            .then((res) => {
                expect(res).to.have.status(400)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 400 if status is BID but not authenticated", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=BID")
            .then((res) => {
                expect(res).to.have.status(400)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 400 if status is OPEN but not authenticated", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=OPEN")
            .then((res) => {
                expect(res).to.have.status(400)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200 with 10 objects if status is OPEN and logged in as user1", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=OPEN")
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(10)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200 with 0 objects if status is OPEN and logged in as user2", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=OPEN")
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200 with 0 objects if status is BID and logged in as user1", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=BID")
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200 with 1 objects if status is BID and logged in as user2", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=BID")
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(1)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200 with 0 objects if status is ARCHIVE, logged in as user2", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=ARCHIVE")
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
            .catch((err) => {
                throw err
            })
    })

  
})

describe("Searching by query string", () => {
    it("Should return 200, with 6 objects when searching OPEN auctions with the string 'and' as user 1", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=OPEN&q=and")
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(6)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with 0 objects when searching OPEN auctions with the string 'and' as user 2", () => {
        return chai.request(SERVER_URL)
            .get("/search?status=OPEN&q=and")
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with 1 objects when searching all items with the string 'uv'", () => {
        return chai.request(SERVER_URL)
            .get("/search?q=uv")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(1)
            })
            .catch((err) => {
                throw err
            })
    })

    it("Should return 200, with 0 objects when searching all auctions with the string 'xxx'", () => {
        return chai.request(SERVER_URL)
            .get("/search?q=xxx")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
            .catch((err) => {
                throw err
            })
    })
})
