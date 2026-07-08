const Joi = require('joi');
const itemModel = require('../models/item.server.model');

const create_item = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        starting_bid: Joi.number().integer().min(0).required(),
        end_date: Joi.date().iso().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { name, description, starting_bid, end_date } = req.body;
    const creator_id = req.user_id; // Added by authentication middleware
    
    const end_timestamp = new Date(end_date).getTime();

    itemModel.insertItem(
        name,
        description,
        starting_bid,
        end_timestamp,
        creator_id,
        (err, item_id) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to create item' });
            }
            res.status(201).json({ item_id });
        }
    );
};

const get_item = (req, res) => {
    const item_id = req.params.item_id;

    itemModel.getItemById(item_id, (err, item) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve item' });
        }

        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.status(200).json(item);
    });
};

const add_bid = (req, res) => {
    const item_id = req.params.item_id;
    const user_id = req.user_id; // From auth middleware

    const schema = Joi.object({
        amount: Joi.number().integer().min(1).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    const { amount } = req.body;

    // 1. Fetch item to check current bid and end date
    itemModel.getItemById(item_id, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.status(404).json({ error: 'Item not found' });

        // 2. Check if auction is still active
        if (Date.now() > item.end_date) {
            return res.status(400).json({ error: 'Auction has ended' });
        }

        // 3. Check if bid is high enough
        const current_highest = item.current_bid || 0;
        const min_bid = Math.max(item.starting_bid, current_highest);

        if (amount <= min_bid) {
            return res.status(400).json({ error: `Bid must be higher than ${min_bid}` });
        }

        // 4. Record the bid
        itemModel.addBid(item_id, user_id, amount, (err) => {
            if (err) return res.status(500).json({ error: 'Failed to place bid' });
            res.sendStatus(201);
        });
    });
};

const get_bid_history = (req, res) => {
    const item_id = req.params.item_id;

    itemModel.getBids(item_id, (err, bids) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to retrieve bids' });
        }
        res.status(200).json(bids);
    });
};

const search_items = (req, res) => {
    const schema = Joi.object({
        q: Joi.string().optional(),
    }).unknown(true);

    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    itemModel.searchItems(req.query, (err, items) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to search items' });
        }
        res.status(200).json(items);
    });
};

module.exports = {
    create_item,
    get_item,
    add_bid,
    get_bid_history,
    search_items
};

