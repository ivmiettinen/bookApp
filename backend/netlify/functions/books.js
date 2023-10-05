const express = require('express');
const serverless = require('serverless-http');
const middleware = require('./utils/middleware');
const jwt = require('jsonwebtoken');

const app = express();

const router = express.Router();

const mongoose = require('mongoose');

const config = require('./utils/config');

const logger = require('./utils/logger');

app.use(express.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://eclectic-tartufo-15ebc4.netlify.app/');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//Book model:
let Book;

try {
    Book = mongoose.model('Book');
} catch (e) {
    const bookSchema = new mongoose.Schema({
        id: Number,
        title: { type: String, required: true },
        author: { type: String, required: true },
        url: { type: String, required: true },
        likes: Number,
        likesbyId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    });

    bookSchema.set('toJSON', {
        transform: (document, returnedObject) => {
            returnedObject.id = returnedObject._id.toString();
            delete returnedObject._id;
            delete returnedObject.__v;
        },
    });

    Book = mongoose.model('Book', bookSchema);
}

//User model:

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

//////////Connect to DB:

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

router.get('/', async (request, response, next) => {
    try {
        const books = await Book.find({}, '-user');
        if (books) {
            response.json(books.map((allBooks) => allBooks.toJSON()));
        } else {
            response.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

router.get('/:id', async (request, response, next) => {
    try {
        const books = await Book.findById(request.params.id);

        if (books) {
            response.json(books.toJSON());
        } else {
            response.status(404).end();
        }
    } catch (exception) {
        next(exception);
    }
});

router.post('/', async (request, response, next) => {
    const body = request.body;

    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!request.token || !decodedToken.id || request.token === null) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }
    const user = await User.findById(decodedToken.id);

    const book = new Book({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        user: user._id,
    });
    try {
        if (
            body.title !== undefined &&
            body.author !== undefined &&
            body.url !== undefined
        ) {
            const savedBook = await book.save();

            user.books = user.books.concat(savedBook._id);
            await user.save();
            response.json(savedBook.toJSON());
        } else {
            response.status(400).send('Bad request. Information missing.');
        }
    } catch (exception) {
        next(exception);
    }
});

router.delete('/:id', async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }
    const user = await User.findById(decodedToken.id);

    const book = await Book.findById(request.params.id);

    if (user._id.toString() !== book.user.toString()) {
        //Deleter of the blog is not the same user as blog's adder
        return response.status(400).json({ error: 'invalid user' });
    }

    try {
        await Book.findByIdAndRemove(request.params.id);
        response.status(204).end();
    } catch (exception) {
        next(exception);
    }
});

router.put('/:id', async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET);
    const userId = request.params.id;

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' });
    }

    try {
        const book = await Book.findById(request.params.id);
        const userIndex = book.likesbyId.indexOf(request.params.id);

        if (userIndex === -1) {
            // User has not liked the post, add the like
            book.likesbyId.push(userId);
            book.likes += 1;
        } else {
            // User has already liked the post, remove the like
            book.likesbyId.pull(userId);
            book.likes -= 1;
        }

        book.save();
        response.json(book.toJSON());
    } catch (exception) {
        console.log('exception', exception);
        next(exception);
    }
});

app.use('/.netlify/functions/books', router);

module.exports.handler = serverless(app);
