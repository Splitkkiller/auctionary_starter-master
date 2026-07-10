const db = require('../../database');
const crypto = require('crypto');

exports.insertUser = (first_name, last_name, email, passwordHash, salt, done) => {
    db.run(
        'INSERT INTO users (first_name, last_name, email, password, salt) VALUES (?, ?, ?, ?, ?)',
        [first_name, last_name, email, passwordHash, salt],
        function(err) {
            if (err) return done(err);
            done(null, this.lastID);
        }
    );
};

exports.getUserByEmail = (email, done) => {
    db.get(
        'SELECT user_id as id, password as passwordHash, salt FROM users WHERE email = ?',
        [email],
        (err, row) => {
            if (err) return done(err);
            done(null, row);
        }
    );
};

exports.setToken = (userId, done) => {
    db.get(
        'SELECT session_token FROM users WHERE user_id = ?',
        [userId],
        (err, row) => {
            if (err) return done(err);

            if (row && row.session_token) {
                return done(null, row.session_token);
            }

            const token = crypto.randomBytes(16).toString('hex');
            db.run(
                'UPDATE users SET session_token = ? WHERE user_id = ?',
                [token, userId],
                (err) => {
                    if (err) return done(err);
                    done(null, token);
                }
            );
        }
    );
};

exports.getToken = (userId, done) => {
    db.get(
        'SELECT session_token FROM users WHERE user_id = ?',
        [userId],
        (err, row) => {
            if (err) return done(err);
            done(null, row ? row.session_token : null);
        }
    );
};

exports.getIDFromToken = (token, done) => {
    db.get(
        'SELECT user_id as id FROM users WHERE session_token = ?',
        [token],
        (err, row) => {
            if (err) return done(err);
            if (!row) return done(null, null);
            done(null, row.id);
        }
    );
};

exports.removeToken = (token, done) => {
    db.run(
        'UPDATE users SET session_token = NULL WHERE session_token = ?',
        [token],
        function(err) {
            if (err) return done(err);

            // This logs 1 if a user was found and logged out,
            // or 0 if the token was invalid.
            console.log(`Logout attempt - Rows affected: ${this.changes}`);

            done(null);
        }
    );
};



exports.getUserProfile = (user_id, done) => {

    db.get(
        'SELECT user_id, first_name, last_name FROM users WHERE user_id = ?',
        [user_id],
        (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, null);

            const now = Date.now();

            const sellingSql = `
                SELECT i.item_id, i.name, i.description, i.starting_bid, i.end_date, i.creator_id, u.first_name, u.last_name
                FROM items i
                JOIN users u ON i.creator_id = u.user_id
                WHERE i.creator_id = ? AND i.end_date > ?
                ORDER BY i.item_id ASC
            `;

            const biddingSql = `
                SELECT DISTINCT i.item_id, i.name, i.description, i.starting_bid, i.end_date, i.creator_id, u.first_name, u.last_name
                FROM items i
                JOIN users u ON i.creator_id = u.user_id
                JOIN bids b ON b.item_id = i.item_id
                WHERE b.user_id = ? AND i.creator_id != ? AND i.end_date > ?
                ORDER BY i.item_id ASC
            `;

            const archiveSql = `
                SELECT DISTINCT i.item_id, i.name, i.description, i.starting_bid, i.end_date, i.creator_id, u.first_name, u.last_name
                FROM items i
                JOIN users u ON i.creator_id = u.user_id
                LEFT JOIN bids b ON b.item_id = i.item_id AND b.user_id = ?
                WHERE i.end_date <= ? AND (i.creator_id = ? OR b.user_id IS NOT NULL)
                ORDER BY i.item_id ASC
            `;

            db.all(sellingSql, [user_id, now], (err, selling) => {
                if (err) return done(err);

                db.all(biddingSql, [user_id, user_id, now], (err, bidding_on) => {
                    if (err) return done(err);

                    db.all(archiveSql, [user_id, now, user_id], (err, auctions_ended) => {
                        if (err) return done(err);

                        user.selling = selling || [];
                        user.bidding_on = bidding_on || [];
                        user.auctions_ended = auctions_ended || [];
                        done(null, user);
                    });
                });
            });
        }
    );
};
