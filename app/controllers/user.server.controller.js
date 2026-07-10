const Joi = require('joi');
const crypto = require('crypto');
const userModel = require('../models/user.server.model');
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;

// CREATE ACCOUNT
const create_account = (req, res) => {
    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        email: Joi.string().email().required(),
password: Joi.string().min(8).max(30).pattern(PASSWORD_PATTERN).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { first_name, last_name, email, password } = req.body;

    // generate salt
    const salt = crypto.randomBytes(16).toString('hex');

    // hash password
    const passwordHash = crypto
        .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
        .toString('hex');

    userModel.insertUser(
        first_name,
        last_name,
        email,
        passwordHash,
        salt,
        (err, id) => {
            if (err) {
                return res.status(400).json({ error_message: 'Email already in use' });
            }

            res.status(201).json({
                message: 'Account created',
                user_id: id
            });
        }
    );
};

// LOGIN
const login = (req, res) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error_message: error.details[0].message });
    }

    const { email, password } = req.body;

    userModel.getUserByEmail(email, (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error_message: 'Invalid email or password' });
        }

        const hash = crypto
            .pbkdf2Sync(password, user.salt, 10000, 64, 'sha512')
            .toString('hex');

        if (hash !== user.passwordHash) {
            return res.status(400).json({ error_message: 'Invalid email or password' });
        }

        // 🔑 create token
        userModel.setToken(user.id, (err, token) => {
            if (err) return res.sendStatus(500);

            res.status(200).json({
                user_id: user.id,
                session_token: token
            });
        });
    });
};

// LOGOUT
const logout = (req, res) => {
    const token = req.get('X-Authorization');

    if (!token) {
        return res.status(401).json({ error_message: 'No session token provided' });
    }

    userModel.removeToken(token, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.status(200).json({ message: 'Logged out' });
    });
};

// GET USER PROFILE
const get_user = (req, res) => {
    const user_id = req.params.user_id;

    // Call the model function that fetches user info + their items
    userModel.getUserProfile(user_id, (err, user) => {
        if (err) {
            console.error(err);
            return res.sendStatus(500);
        }

        if (!user) {
            return res.status(404).json({ error_message: 'User not found' });
        }

        // Success: returns first_name, last_name, and items array
        res.status(200).json(user);
    });
};

module.exports = {
    create_account,
    login,
    logout,
    get_user
};

