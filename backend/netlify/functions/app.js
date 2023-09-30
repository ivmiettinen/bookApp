const express = require('express');

const serverless = require('serverless-http');

const config = require('../../utils/config');

require('express-async-errors');

const app = express();
const cors = require('cors');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
        hello: 'hi!',
    });
});

app.use('/.netlify/functions/app', router);

// const booksRouter = require('./books')

const middleware = require('../../utils/middleware');

const logger = require('../../utils/logger');

const mongoose = require('mongoose');

// const usersRouter = require('./users')

// const loginRouter = require('./login')

logger.info('connecting to', config.MONGODB_URI);

mongoose
    .connect(config.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        logger.info('connected to MongoDB');
    })
    .catch((error) => {
        logger.error('error connection to MongoDB:', error.message);
    });

app.use(cors());

app.use(express.static('build'));

app.use(express.json());

app.use(middleware.requestLogger);

app.use(middleware.tokenExtractor);

// app.use('/api/books', booksRouter)

// app.use('/api/users', usersRouter)

// app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports.handler = serverless(app);
