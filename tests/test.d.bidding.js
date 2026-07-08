/*
    Test the POST /item/:item_id/bid endpoint
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

describe('Bidding on an auction when not authenticated', () => {
    before(() => {
        console.log('[Script: ' + filename + ']')
    })

    it('Should return a 401', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .send({
                    "amount": 3595,
                })
            .then((res) => {
                expect(res).to.have.status(401)
            })
            .catch((err) => {
                throw err
            })
    })
})

describe('Log into user account', () => {
    before(() => {
        console.log('[Script: ' + filename + ']')
    })

    it('Should return 200, and JSON with user_id and session_token of the user', () => {
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

    it('Should return 200, and JSON with user_id and session_token of the user', () => {
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

describe('Test bidding when logged in which should not pass validation checks', () => {
    before(() => {
        console.log("[Script: " + filename + "]")
    })

    it('Should return 400 status code: extra field', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": 3595,
                "extra": "field"
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    })

    it('Should return 400 status code: blank amount', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": null,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    })

    it('Should return 400 status code: invalid amount', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": -1,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    })

    it('Should return 400 status code: amount less or equal than current bid (3595)', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": 3594,
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    })
})

describe('Test bidding in situations that should fail', () => {
    before(() => {
        console.log("[Script: " + filename + "]")
    })

    it('Should return 403 status code: can not bid on own items', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER1)
            .send({
                "amount": 3595,
            })
            .then((res) => {
                expect(res).to.have.status(403)
            })
            .catch((err) => {
                throw err
            });
    })

    it('Should return 404 status code: item does not exist', () => {
        return chai.request(SERVER_URL)
            .post('/item/15/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": 3595,
            })
            .then((res) => {
                expect(res).to.have.status(404)
            })
            .catch((err) => {
                throw err
            });
    })

})


describe('Test bidding success', () => {
    before(() => {
        console.log("[Script: " + filename + "]")
    })

    it('Should return 201 status code', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": 3595,
            })
            .then((res) => {
                expect(res).to.have.status(201)
            })
            .catch((err) => {
                throw err
            });
    })

    it('Should return 201 status code', () => {
        return chai.request(SERVER_URL)
            .post('/item/1/bid')
            .set('X-Authorization', SESSION_TOKEN_USER2)
            .send({
                "amount": 3596,
            })
            .then((res) => {
                expect(res).to.have.status(201)
            })
            .catch((err) => {
                throw err
            });
    })
})
