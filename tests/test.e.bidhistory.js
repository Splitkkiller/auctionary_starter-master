/* 
    Test the GET /item/:item_id/bid end point 
*/
const chai = require('chai')
const chaiHttp = require('chai-http')

const expect = chai.expect
chai.use(chaiHttp)

const path = require('path')
const filename = path.basename(__filename)

const good_user_data = require('./data/good_user_data.json')
const good_item_data = require('./data/good_item_data.json')

const SERVER_URL = 'http://localhost:3333'


describe("Getting bid history of an auction that does not exist", () => {
    it("Should return 404", () => {
        return chai.request(SERVER_URL)
            .get("/item/1000/bid")
            .then((res) => {
                expect(res).to.have.status(404)
            })
    })
})

describe("Getting bid history of an auction with no bids", () => {
    it("Should return 200 but with an empty list", () => {
        return chai.request(SERVER_URL)
            .get("/item/2/bid")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(0)
            })
    })
})

describe("Getting bid history of an auction with bids", () => {
    it("Should return 200 with two bids", () => {
        return chai.request(SERVER_URL)
            .get("/item/1/bid")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res.body.length).to.equal(2)

                let bid1 = res.body[0];
                // console.log(bid1)

                // expect(bid1).to.be.json
                expect(bid1).to.have.property("item_id")
                expect(bid1).to.have.property("amount")
                expect(bid1).to.have.property("timestamp")
                expect(bid1).to.have.property("user_id")
                expect(bid1).to.have.property("first_name")
                expect(bid1).to.have.property("last_name")

                //check ordering
                expect(bid1.item_id).to.equal(1)
                expect(bid1.amount).to.equal(3596)
            })
    })
})