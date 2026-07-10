const db = require('../../database');

// --- ITEM LOGIC ---

exports.insertItem = (name, description, starting_bid, end_date, creator_id, done) => {
    const start_date = Date.now(); // Current timestamp
    
    db.run(
        'INSERT INTO items (name, description, starting_bid, start_date, end_date, creator_id) VALUES (?, ?, ?, ?, ?, ?)',
        [name, description, starting_bid, start_date, end_date, creator_id],
        function(err) {
            if (err) return done(err);
            done(null, this.lastID);
        }
    );
};

exports.getItemById = (item_id, done) => {
    db.get(
        `SELECT 
            i.item_id,
            i.name,
            i.description,
            i.starting_bid,
            i.start_date,
            i.end_date,
            i.creator_id,
            u.first_name,
            u.last_name,
            MAX(b.amount) as current_bid
        FROM items i
        LEFT JOIN users u ON i.creator_id = u.user_id
        LEFT JOIN bids b ON i.item_id = b.item_id
        WHERE i.item_id = ?
        GROUP BY i.item_id`,
        [item_id],
        (err, row) => {
    if (err) return done(err);
    if (!row) return done(null, null);

    const hasBids = row.current_bid !== null && row.current_bid !== undefined;

    // If nobody has bid yet, the "current" bid is just the starting bid
    if (!hasBids) {
        row.current_bid = row.starting_bid;
    }

    if (hasBids) {
        db.get(
            `SELECT u.user_id, u.first_name, u.last_name
            FROM bids b
            JOIN users u ON b.user_id = u.user_id
            WHERE b.item_id = ? AND b.amount = ?`,
            [item_id, row.current_bid],
            (err, bidder) => {
                if (err) return done(err);
                row.current_bid_holder = bidder;
                done(null, row);
            }
        );
    } else {
        row.current_bid_holder = null;
        done(null, row);
    }
}
    );
};

exports.searchItems = (options, done) => {
    const { q, status, user_id, limit, offset } = options;
    const now = Date.now();

    let sql = `
        SELECT DISTINCT i.item_id, i.name, i.description, i.end_date, i.creator_id, u.first_name, u.last_name
        FROM items i
        JOIN users u ON i.creator_id = u.user_id
    `;

    const params = [];
    const conditions = [];

    if (status === 'BID') {
        sql += ` JOIN bids b ON b.item_id = i.item_id`;
        conditions.push('b.user_id = ?');
        params.push(user_id);
        conditions.push('i.creator_id != ?');
        params.push(user_id);
        conditions.push('i.end_date > ?');
        params.push(now);
    } else if (status === 'OPEN') {
        conditions.push('i.creator_id = ?');
        params.push(user_id);
        conditions.push('i.end_date > ?');
        params.push(now);
    } else if (status === 'ARCHIVE') {
        sql += ` LEFT JOIN bids b ON b.item_id = i.item_id AND b.user_id = ?`;
        params.push(user_id);
        conditions.push('i.end_date <= ?');
        params.push(now);
        conditions.push('(i.creator_id = ? OR b.user_id IS NOT NULL)');
        params.push(user_id);
    }

    if (q) {
        conditions.push('(i.name LIKE ? OR i.description LIKE ?)');
        params.push(`%${q}%`, `%${q}%`);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY i.item_id ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    db.all(sql, params, (err, rows) => {
        if (err) return done(err);
        done(null, rows || []);
    });
};

// --- BIDDING LOGIC ---

exports.addBid = (item_id, user_id, amount, done) => {
    const timestamp = Date.now();
    db.run(
        'INSERT INTO bids (item_id, user_id, amount, timestamp) VALUES (?, ?, ?, ?)',
        [item_id, user_id, amount, timestamp],
        (err) => done(err)
    );
};

exports.getBids = (item_id, done) => {
    db.all(
        `SELECT b.item_id, b.amount, b.timestamp, u.user_id, u.first_name, u.last_name
         FROM bids b JOIN users u ON b.user_id = u.user_id
         WHERE b.item_id = ? ORDER BY b.amount DESC`,
        [item_id],
        (err, rows) => done(err, rows)
    );
};

// --- QUESTION & ANSWER LOGIC ---

exports.addQuestion = (item_id, user_id, text, done) => {
    db.run(
        'INSERT INTO questions (item_id, asked_by, question) VALUES (?, ?, ?)',
        [item_id, user_id, text],
        (err) => done(err)
    );
};

// Required for the answering logic in the controller
exports.getQuestionById = (question_id, done) => {
    db.get('SELECT * FROM questions WHERE question_id = ?', [question_id], (err, row) => {
        done(err, row);
    });
};

// Update a question with an answer
exports.addAnswer = (question_id, answer, done) => {
    db.run(
        'UPDATE questions SET answer = ? WHERE question_id = ?',
        [answer, question_id],
        (err) => done(err)
    );
};

exports.getQuestions = (item_id, done) => {
    db.all(
        `SELECT q.question_id, q.question AS question_text, q.answer AS answer_text, u.first_name, u.last_name
         FROM questions q
         JOIN users u ON q.asked_by = u.user_id
         WHERE q.item_id = ?
         ORDER BY q.question_id DESC`,
        [item_id],
        (err, rows) => done(err, rows)
    );
};

module.exports = exports;