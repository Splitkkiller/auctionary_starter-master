/*
    Test the question endpoints:
        POST /item/:item_id/question
        POST /question/:question_id
        GET /item/:item_id/question
*/

/* 
    Test the POST /event/:event_id/question end point and DELETE /question/:question_id end point
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


describe("Test asking question if not logged in", () => {
    before(() => {
        console.log('[Script: ' + filename + ']')
    })

    
    it('Should return 401', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .send({
                "question_text": "Whats the time mr wolf?"
            })
            .then((res) => {
                expect(res).to.have.status(401)
            })
            .catch((err) => {
                throw err
            })
    })
})

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

describe("Test asking questions if logged in", () => {
    before(() => {
        console.log('[Script: ' + filename + ']')
    })

    it('Should return 200 - user 2 asking a question on item 1', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "question_text": "What condition is this in?"
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 200 - user 2 asking a question on item 1', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "question_text": "This is my second question?"
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 403 - user 1 asking a question on item 1 as they are the creator', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({
                "question_text": "What condition is this in?"
            })
            .then((res) => {
                expect(res).to.have.status(403)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 400 if question is empty', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "question_text": ""
            })
            .then((res) => {
                expect(res).to.have.status(400)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 400 if question is missing', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({})
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property("error_message")
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 400 if extra field is present', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/question')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "question_text": "What condition is this in?",
                "extra": "field"
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property("error_message")
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 404 if item does not exist', () => {
        return chai.request(SERVER_URL)
            .post('/item/1000/question')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "question_text": "What condition is this in?"
            })
            .then((res) => {
                expect(res).to.have.status(404)
            })
            .catch((err) => {
                throw err
            })
    })

})


describe("Test answering questions", () => {
    it('Should return 401 if not logged in', () => {
        return chai.request(SERVER_URL)
            .post('/question/1')
            .send({
                "answer_text": "Its brand new, just a couple of scratches"
            })
            .then((res) => {
                expect(res).to.have.status(401)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 403 if user 2 trys to answer a question for an auction they did not create', () => {
        return chai.request(SERVER_URL)
            .post('/question/1')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "answer_text": "Its brand new, just a couple of scratches"
            })
            .then((res) => {
                expect(res).to.have.status(403)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 404 if the question does not exist', () => {
        return chai.request(SERVER_URL)
            .post('/question/1000')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({
                "answer_text": "Its brand new, just a couple of scratches"
            })
            .then((res) => {
                expect(res).to.have.status(404)
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 400 if the answer is blank', () => {
        return chai.request(SERVER_URL)
            .post('/question/1000')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({
                "answer_text": ""
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property("error_message")
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 400 if the answer is missing', () => {
        return chai.request(SERVER_URL)
            .post('/question/1000')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({})
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property("error_message")
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 400 if the answer contains an extra field', () => {
        return chai.request(SERVER_URL)
            .post('/question/1000')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({
                "answer_text": "Its brand new, just a couple of scratches",
                "extra": "field"
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property("error_message")
            })
            .catch((err) => {
                throw err
            })
    })

    it('Should return 200 if user 1 answers a question on item 1', () => {
        return chai.request(SERVER_URL)
            .post('/question/1')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({
                "answer_text": "Its brand new, just a couple of scratches"
            })
            .then((res) => {
                expect(res).to.have.status(200)
            })
            .catch((err) => {
                throw err
            })
    })
})


describe("Test retrieving questions", () => {
    it("Should return 404 if the item does not exist", () => {
        return chai.request(SERVER_URL)
            .get("/item/1000/question")
            .then((res) => {
                expect(res).to.have.status(404)
            })
    })

    it("Should return 200, but with an empty list if the item has no questions", () => {
        return chai.request(SERVER_URL)
            .get("/item/2/question")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
    })

    it("Should return 200, with 2 questions on item 1. One question should have an answer and new questions should appear first.", () => {
        return chai.request(SERVER_URL)
            .get("/item/1/question")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(2)

                let question2 = res.body[0]
                let question1 = res.body[1]
                
                expect(question1).to.have.property("question_id")
                expect(question1).to.have.property("question_text")
                expect(question1).to.have.property("answer_text")

                expect(question2).to.have.property("question_id")
                expect(question2).to.have.property("question_text")
                expect(question2).to.have.property("answer_text")

                expect(question1.question_id).to.equal(1)
                expect(question1.question_text).to.equal("What condition is this in?")
                expect(question1.answer_text).to.equal("Its brand new, just a couple of scratches")

                expect(question2.question_id).to.equal(2)
                expect(question2.question_text).to.equal("This is my second question?")
                expect(question2.answer_text).to.be.null
            })
    })
})

