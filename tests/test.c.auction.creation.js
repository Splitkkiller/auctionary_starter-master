/*
    Test the POST /item endpoint
*/

const chai = require("chai");
const chaiHttp = require("chai-http")

const expect = chai.expect
chai.use(chaiHttp)

const path = require('path')
const filename = path.basename(__filename)

const SERVER_URL = 'http://localhost:3333'

const good_user_data = require('./data/good_user_data.json');
const good_item_data = require('./data/good_item_data.json');
const bad_item_data = require('./data/bad_item_data.json');

let SESSION_TOKEN = ''

describe("Test adding items if not logged in", () => {
    before(() => {
        console.log('[Script: ' + filename + ']')
    })

    good_item_data.forEach((item) => {
        it('Should return 401', () => {
            return chai.request(SERVER_URL)
                .post('/item')
                .send({
                    "name": item.name,
                    "description": item.description,
                    "starting_bid": item.starting_bid,
                    "end_date": item.end_date
                })
                .then((res) => {
                    expect(res).to.have.status(401)
                })
                .catch((err) => {
                    throw err
                })
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
                SESSION_TOKEN = res.body.session_token
            })
            .catch((err) => {
                throw err
            })
    })
})

describe('Test successful creation of items when logged in', () => {
    before(() => {
        console.log("[Script: " + filename + "]")
    })

    good_item_data.forEach((item) => {
        it('Should return 201, and JSON with item_id of new item: ' + item.name, () => {
            return chai.request(SERVER_URL)
                .post("/item")
                .set('X-Authorization', SESSION_TOKEN)
                .send({
                    "name": item.name,
                    "description": item.description,
                    "starting_bid": item.starting_bid,
                    "end_date": item.end_date
                })
                .then((res) => {
                    expect(res).to.have.status(201)
                    expect(res).to.be.json
                    expect(res.body).to.have.property("item_id")
                })
                .catch((err) => {
                    throw err
                })
        })
    })
})

describe('Test creation of events when logged in which should not pass validation checks', () => {
    before(() => {
        console.log("[Script: " + filename + "]")
    })

    it('Should return 400 status code: missing name', () => {
        return chai.request(SERVER_URL)
            .post('/item')
            .set('X-Authorization', SESSION_TOKEN)
            .send({
                "description": good_item_data[0].description,
                "starting_bid": good_item_data[0].starting_bid,
                "end_date": good_item_data[0].end_date
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    });

    it('Should return 400 status code: missing description', () => {
        return chai.request(SERVER_URL)
            .post('/item')
            .set('X-Authorization', SESSION_TOKEN)
            .send({
                "name": good_item_data[0].name,
                "starting_bid": good_item_data[0].starting_bid,
                "end_date": good_item_data[0].end_date
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    });

    it('Should return 400 status code: missing starting_bid', () => {
        return chai.request(SERVER_URL)
            .post('/item')
            .set('X-Authorization', SESSION_TOKEN)
            .send({
                "name": good_item_data[0].name,
                "description": good_item_data[0].description,
                "end_date": good_item_data[0].end_date
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    });

    it('Should return 400 status code: missing end_date', () => {
        return chai.request(SERVER_URL)
            .post('/item')
            .set('X-Authorization', SESSION_TOKEN)
            .send({
                "name": good_item_data[0].name,
                "description": good_item_data[0].description,
                "starting_bid": good_item_data[0].starting_bid
            })
            .then((res) => {
                expect(res).to.have.status(400)
                expect(res).to.be.json
                expect(res.body).to.have.property('error_message')
            })
            .catch((err) => {
                throw err
            });
    });

    it('Should return 400 status code: extra field', () => {
        return chai.request(SERVER_URL)
            .post('/item')
            .set('X-Authorization', SESSION_TOKEN)
            .send({
                "name": good_item_data[0].name,
                "description": good_item_data[0].description,
                "starting_bid": good_item_data[0].starting_bid,
                "end_date": good_item_data[0].end_date,
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
    });

    bad_item_data.forEach((item) => {
        it('Should return a 400 status code: ' + item.test_description, () => {
            return chai.request(SERVER_URL)
                .post('/item')
                .set('X-Authorization', SESSION_TOKEN)
                .send({
                    "name": item.name,
                    "description": item.description,
                    "starting_bid": item.starting_bid,
                    "end_date": item.end_date
                })
                .then((res) => {
                    expect(res).to.have.status(400)
                    expect(res).to.be.json
                    expect(res.body).to.have.property('error_message')
                })
                .catch((err) => {
                    throw err
                })
        })
    })

})

