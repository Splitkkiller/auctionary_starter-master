const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.server.controller');
const authenticate = require('../authentication');

// Create account 
router.post('/users', userController.create_account);

// Login 
router.post('/login', userController.login);

// Logout 
router.post('/logout', authenticate, userController.logout);

router.get('/users/:user_id', userController.get_user);



module.exports = router;


