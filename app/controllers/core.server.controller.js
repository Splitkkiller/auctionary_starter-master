const Joi = require('joi');
const itemModel = require('../models/item.server.model');
const userModel = require('../models/user.server.model');

const create_item = (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        starting_bid: Joi.number().integer().min(0).required(),
        end_date: Joi.number().integer().required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { name, description, starting_bid, end_date } = value;
    const creator_id = req.user_id; // Added by authentication middleware

    if (end_date <= Date.now()) {
        return res.status(400).json({ error_message: 'end_date must be in the future' });
    }

    itemModel.insertItem(
        name,
        description,
        starting_bid,
        end_date,
        creator_id,
        (err, item_id) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error_message: 'Failed to create item' });
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
            return res.status(500).json({ error_message: 'Failed to retrieve item' });
        }

        if (!item) {
            return res.status(404).json({ error_message: 'Item not found' });
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

    const { error, value } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { amount } = value;

    itemModel.getItemById(item_id, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.status(404).json({ error_message: 'Item not found' });

        // 1. Can't bid on your own item
        if (item.creator_id === user_id) {
            return res.status(403).json({ error_message: 'You cannot bid on your own item' });
        }

        // 2. Check if auction is still active
        if (Date.now() > item.end_date) {
            return res.status(400).json({ error_message: 'Auction has ended' });
        }

        // 3. Check if bid is high enough
        const min_bid = item.current_bid;

        if (amount <= min_bid) {
            return res.status(400).json({ error_message: `Bid must be higher than ${min_bid}` });
        }

        // 4. Record the bid
        itemModel.addBid(item_id, user_id, amount, (err) => {
            if (err) return res.status(500).json({ error_message: 'Failed to place bid' });
            res.sendStatus(201);
        });
    });
};

const get_bid_history = (req, res) => {
    const item_id = req.params.item_id;

    itemModel.getItemById(item_id, (err, item) => {
        if (err) return res.sendStatus(500);
        if (!item) return res.status(404).json({ error_message: 'Item not found' });

        itemModel.getBids(item_id, (err, bids) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error_message: 'Failed to retrieve bids' });
            }
            res.status(200).json(bids);
        });
    });
};

const VALID_STATUSES = ['OPEN', 'BID', 'ARCHIVE'];

const search_items = (req, res) => {
    const schema = Joi.object({
        q: Joi.string().allow('').optional(),
        status: Joi.string().optional(),
        limit: Joi.number().integer().min(0).optional(),
        offset: Joi.number().integer().min(0).optional()
    });

    const { error, value } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { q, status, limit, offset } = value;

    if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error_message: 'Invalid status filter' });
    }

    const finishSearch = (user_id) => {
        itemModel.searchItems(
            {
                q,
                status,
                user_id,
                limit: limit !== undefined ? limit : 10,
                offset: offset !== undefined ? offset : 0
            },
            (err, items) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error_message: 'Failed to search items' });
                }
                res.status(200).json(items);
            }
        );
    };

    if (status) {
        const token = req.get('X-Authorization');
        if (!token) {
            return res.status(400).json({ error_message: 'Authentication required for this status filter' });
        }

        userModel.getIDFromToken(token, (err, user_id) => {
            if (err) return res.sendStatus(500);
            if (!user_id) {
                return res.status(400).json({ error_message: 'Invalid session token' });
            }
            finishSearch(user_id);
        });
    } else {
        finishSearch(null);
    }
};

module.exports = {
    create_item,
    get_item,
    add_bid,
    get_bid_history,
    search_items
};

