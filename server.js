const express = require('express');
const morgan  = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());

// Server port
const HTTP_PORT = 3333;

// Logging
app.use(morgan('tiny'));

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res) => {
    res.json({ status: 'Alive' });
});


const userRoutes = require('./app/routes/user.server.routes');
const coreRoutes = require('./app/routes/core.server.routes');
const questionRoutes = require('./app/routes/question.server.routes');

app.use('/', userRoutes);
app.use('/', coreRoutes);
app.use('/', questionRoutes);


// Default response
app.use((req, res) => {
    res.sendStatus(404);
});

// Start server
app.listen(HTTP_PORT, () => {
    console.log('Server running on port: ' + HTTP_PORT);
});
