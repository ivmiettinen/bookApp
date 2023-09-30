const express = require('express');
const serverless = require('serverless-http');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const middleware = require('./utils/middleware');
// const User = require('../models/user')

const app = express();

const config = require('./utils/config');
const logger = require('./utils/logger');

//User model:
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

let User;

try {
    User = mongoose.model('User');
} catch (e) {
    const userSchema = mongoose.Schema({
        username: {
            type: String,
            minLength: 3,
            required: true,
            unique: true,
        },
        email: { type: String, required: true },
        passwordHash: { type: String, minlength: 3, required: true },
        books: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
            },
        ],
    });

    userSchema.plugin(uniqueValidator);

    userSchema.set('toJSON', {
        transform: (document, returnedObject) => {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
            delete returnedObject.__v;
            delete returnedObject.passwordHash;
        },
    });

    User = mongoose.model('User', userSchema);
}

//Connect to DB:

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

router.post('/', async (request, response, next) => {
    const body = request.body;

    const saltRounds = 10;

    if (body.password === undefined) {
        return response.status(400).json({
            error: 'password must be included in your post',
        });
    }

    if (body.password.length < 8) {
        return response.status(400).json({
            error: 'password must be 8 letters or longer',
        });
    }

    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    const user = new User({
        username: body.username,
        email: body.email,
        passwordHash,
    });

    //Create and sign a token:

    const userForToken = {
        username: user.username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: 60 * 60,
    });

    try {
        await user.save();
        response
            .status(201)
            .send({ token, username: user.username, email: user.email });
    } catch (exception) {
        next(exception);
    }
});

app.use('/.netlify/functions/users', router);

module.exports.handler = serverless(app);
