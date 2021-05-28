const booksRouter = require('express').Router()

const Book = require('../models/book')

const User = require('../models/user')

const jwt = require('jsonwebtoken')

booksRouter.get('/', async (request, response, next) => {
    try {
        const books = await Book.find({}).populate('user', {
            username: 1,
            email: 1,
        })
        if (books) {
            response.json(books.map((allBooks) => allBooks.toJSON()))
        } else {
            response.status(404).end()
        }
    } catch (exception) {
        next(exception)
    }
})

booksRouter.get('/:id', async (request, response, next) => {
    try {
        const books = await Book.findById(request.params.id)

        if (books) {
            response.json(books.toJSON())
        } else {
            response.status(404).end()
        }
    } catch (exception) {
        next(exception)
    }
})

booksRouter.post('/', async (request, response, next) => {
    const body = request.body

    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id ||  request.token === null) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const book = new Book({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        user: user._id,
    })
    try {
        if (body.title !== undefined && body.url !== undefined) {
            const savedBook = await book.save()

            user.books = user.books.concat(savedBook._id)
            await user.save()
            response.json(savedBook.toJSON())
        } else {
            response.status(400).send('Bad request')
        }
    } catch (exception) {
        next(exception)
    }
})

booksRouter.delete('/:id', async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const book = await Book.findById(request.params.id)

    if (user._id.toString() !== book.user.toString()) {
        //Deleter of the blog is not the same user as blog's adder
        return response.status(400).json({ error: 'invalid user' })
    }

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    try {
        await Book.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

booksRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const book = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
    }

    try {
        const books = await Book.findByIdAndUpdate(request.params.id, book, {
            new: true,
        })

        response.json(books.toJSON())
    } catch (exception) {
        console.log('exception', exception)
        next(exception)
    }
})

module.exports = booksRouter
