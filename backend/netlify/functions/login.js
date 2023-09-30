const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

const router = express.Router();

const serverless = require('serverless-http');
const middleware = require('./utils/middleware');

app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

const config = require('./utils/config');
const logger = require('./utils/logger');

//User model:
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

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

//

router.post('/', async (request, response) => {
    const body = request.body;

    const user = await User.findOne({ username: body.username });
    const passwordCorrect =
        user === null
            ? false
            : await bcrypt.compare(body.password, user.passwordHash);

    if (!(user && passwordCorrect)) {
        return response.status(401).json({
            error: 'invalid username or password',
        });
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    };

    const token = jwt.sign(userForToken, process.env.SECRET);

    response
        .status(200)
        .send({ token, username: user.username, email: user.email });
});

app.use('/.netlify/functions/login', router);

module.exports.handler = serverless(app);
