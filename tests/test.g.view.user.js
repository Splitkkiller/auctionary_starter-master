/* 
    Test the GET /user/:user_id end point 
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


describe("Getting user details of a user that does not exist", () => {
    it("Should return 404", () => {
        return chai.request(SERVER_URL)
            .get("/users/1000")
            .then((res) => {
                expect(res).to.have.status(404)
            })
    })
})



describe("Getting user details of a user with no items or bids", () => {
    it("Should return 200 but with empty lists", () => {
        return chai.request(SERVER_URL)
            .get("/users/3")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json

                expect(res.body).to.have.property("user_id")
                expect(res.body.user_id).to.equal(3)
                expect(res.body).to.have.property("first_name")
                expect(res.body.first_name).to.equal(good_user_data[2].first_name)
                expect(res.body).to.have.property("last_name")
                expect(res.body.last_name).to.equal(good_user_data[2].last_name)

                expect(res.body).to.have.property("selling")
                expect(res.body).to.have.property("bidding_on")
                expect(res.body).to.have.property("auctions_ended")
                
                expect(res.body.selling.length).to.equal(0)
                expect(res.body.bidding_on.length).to.equal(0)
                expect(res.body.auctions_ended.length).to.equal(0)

                
            })
    })
})

describe("Getting user details of a user with items but no bids", () => {
    it("Should return 200", () => {
        return chai.request(SERVER_URL)
            .get("/users/1")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json

                expect(res.body).to.have.property("user_id")
                expect(res.body.user_id).to.equal(1)
                expect(res.body).to.have.property("first_name")
                expect(res.body.first_name).to.equal(good_user_data[0].first_name)
                expect(res.body).to.have.property("last_name")
                expect(res.body.last_name).to.equal(good_user_data[0].last_name)

                expect(res.body).to.have.property("selling")
                expect(res.body).to.have.property("bidding_on")
                expect(res.body).to.have.property("auctions_ended")
                
                expect(res.body.selling.length).to.equal(10)
                expect(res.body.bidding_on.length).to.equal(0)
                expect(res.body.auctions_ended.length).to.equal(0)

                let first_item = res.body.selling[0]

                expect(first_item).to.have.property("item_id")
                expect(first_item).to.have.property("name")
                expect(first_item).to.have.property("description")
                expect(first_item).to.have.property("end_date")
                expect(first_item).to.have.property("creator_id")
                expect(first_item).to.have.property("first_name")
                expect(first_item).to.have.property("last_name")

                expect(first_item.item_id).to.equal(1)
                expect(first_item.name).to.equal(good_item_data[0].name)
                expect(first_item.description).to.equal(good_item_data[0].description)
                expect(first_item.end_date).to.equal(good_item_data[0].end_date)

                expect(first_item.creator_id).to.equal(res.body.user_id)
                expect(first_item.first_name).to.equal(res.body.first_name)
                expect(first_item.last_name).to.equal(res.body.last_name)
                
            })
    })
})


describe("Getting user details of a user with no items but bids", () => {
    it("Should return 200", () => {
        return chai.request(SERVER_URL)
            .get("/users/2")
            .then((res) => {
                expect(res).to.have.status(200)
                expect(res).to.be.json

                expect(res.body).to.have.property("user_id")
                expect(res.body.user_id).to.equal(2)
                expect(res.body).to.have.property("first_name")
                expect(res.body.first_name).to.equal(good_user_data[1].first_name)
                expect(res.body).to.have.property("last_name")
                expect(res.body.last_name).to.equal(good_user_data[1].last_name)

                expect(res.body).to.have.property("selling")
                expect(res.body).to.have.property("bidding_on")
                expect(res.body).to.have.property("auctions_ended")
                
                expect(res.body.selling.length).to.equal(0)
                expect(res.body.bidding_on.length).to.equal(1)
                expect(res.body.auctions_ended.length).to.equal(0)

                let first_item = res.body.bidding_on[0]

                expect(first_item).to.have.property("item_id")
                expect(first_item).to.have.property("name")
                expect(first_item).to.have.property("description")
                expect(first_item).to.have.property("end_date")
                expect(first_item).to.have.property("creator_id")
                expect(first_item).to.have.property("first_name")
                expect(first_item).to.have.property("last_name")

                expect(first_item.item_id).to.equal(1)
                expect(first_item.name).to.equal(good_item_data[0].name)
                expect(first_item.description).to.equal(good_item_data[0].description)
                expect(first_item.end_date).to.equal(good_item_data[0].end_date)

                expect(first_item.creator_id).to.equal(1)
                expect(first_item.first_name).to.equal(good_user_data[0].first_name)
                expect(first_item.last_name).to.equal(good_user_data[0].last_name)
                
            })
    })
})
