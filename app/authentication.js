
const userModel = require('./models/user.server.model');


const authenticate = (req, res, next) => {
    const token = req.get('X-Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    userModel.getIDFromToken(token, (err, userId) => {
        if (err || !userId) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // attach user id to request
        req.user_id = userId;
        next();
    });
};

module.exports = authenticate;
