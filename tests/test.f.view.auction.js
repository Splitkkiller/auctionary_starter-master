/* 
    Test the GET /item/:item_id end point 
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


describe("Getting item details of an auction that does not exist", () => {
    it("Should return 404", () => {
        return chai.request(SERVER_URL)
            .get("/item/1000")
            .then((res) => {
                expect(res).to.have.status(404)
            })
    })
})

describe("Getting item details of an auction with no bids", () => {
    it("Should return 200 but with an empty bid holder", () => {
        return chai.request(SERVER_URL)
            .get("/item/2")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json

                expect(res.body).to.have.property("item_id")
                expect(res.body.item_id).to.equal(2)
                expect(res.body).to.have.property("creator_id")
                expect(res.body.creator_id).to.equal(1)

                expect(res.body).to.have.property("name")
                expect(res.body).to.have.property("description")
                expect(res.body).to.have.property("starting_bid")
                expect(res.body).to.have.property("start_date")
                expect(res.body).to.have.property("end_date")
                expect(res.body).to.have.property("first_name")
                expect(res.body).to.have.property("last_name")
                expect(res.body).to.have.property("current_bid")
                expect(res.body).to.have.property("current_bid_holder")

                expect(res.body.name).to.equal(good_item_data[1].name)
                expect(res.body.description).to.equal(good_item_data[1].description)
                expect(res.body.end_date).to.equal(good_item_data[1].end_date)
                expect(res.body.starting_bid).to.equal(good_item_data[1].starting_bid)

                expect(res.body.first_name).to.equal(good_user_data[0].first_name)
                expect(res.body.last_name).to.equal(good_user_data[0].last_name)

                expect(res.body.current_bid).to.equal(res.body.starting_bid)
                expect(res.body.current_bid_holder).to.be.null

                
            })
    })
})

describe("Getting item details of an auction with bids", () => {
    it("Should return 200 but with a bid holder", () => {
        return chai.request(SERVER_URL)
            .get("/item/1")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json

                expect(res.body).to.have.property("item_id")
                expect(res.body.item_id).to.equal(1)
                expect(res.body).to.have.property("creator_id")
                expect(res.body.creator_id).to.equal(1)

                expect(res.body).to.have.property("name")
                expect(res.body).to.have.property("description")
                expect(res.body).to.have.property("starting_bid")
                expect(res.body).to.have.property("start_date")
                expect(res.body).to.have.property("end_date")
                expect(res.body).to.have.property("first_name")
                expect(res.body).to.have.property("last_name")
                expect(res.body).to.have.property("current_bid")
                expect(res.body).to.have.property("current_bid_holder")

                expect(res.body.name).to.equal(good_item_data[0].name)
                expect(res.body.description).to.equal(good_item_data[0].description)
                expect(res.body.end_date).to.equal(good_item_data[0].end_date)
                expect(res.body.starting_bid).to.equal(good_item_data[0].starting_bid)

                expect(res.body.first_name).to.equal(good_user_data[0].first_name)
                expect(res.body.last_name).to.equal(good_user_data[0].last_name)

                expect(res.body.current_bid).to.equal(3596)
                
                expect(res.body.current_bid_holder.user_id).to.equal(2)
                expect(res.body.current_bid_holder.first_name).to.equal(good_user_data[1].first_name)
                expect(res.body.current_bid_holder.last_name).to.equal(good_user_data[1].last_name)

                
            })
    })
})
