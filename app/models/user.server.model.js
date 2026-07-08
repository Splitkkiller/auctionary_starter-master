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
    const token = crypto.randomBytes(16).toString('hex');
    db.run(
        'UPDATE users SET session_token = ? WHERE user_id = ?',
        [token, userId],
        (err) => {
            if (err) return done(err);
            done(null, token);
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

            // 2. Get all items this user is selling
            db.all(
                'SELECT item_id, name, description, starting_bid, start_date, end_date FROM items WHERE creator_id = ?',
                [user_id],
                (err, items) => {
                    if (err) return done(err);
                    
                    // Attach items to the user object
                    user.items = items || [];
                    done(null, user);
                }
            );
        }
    );
};
