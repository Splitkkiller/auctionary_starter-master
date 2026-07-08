const express = require('express');
const router = express.Router();
const core = require('../controllers/core.server.controller');
const authenticate = require('../authentication'); // Import your middleware

// Search does NOT need authentication
router.get('/search', core.search_items);

// Getting a single item does NOT need authentication
router.get('/item/:item_id', core.get_item);

// Creating an item REQUIRES authentication
router.post('/item', authenticate, core.create_item);
router.get('/search', core.search_items);
router.get('/item/:item_id', authenticate, core.get_item);

module.exports = router;
