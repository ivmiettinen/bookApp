const booksRouter = require('express').Router()

const Book = require('../models/book')

const User = require('../models/user')

const jwt = require('jsonwebtoken')

booksRouter.get('/', async (request, response, next) => {
    try {
        const books = await Book.find({}, '-user')
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

    if (!request.token || !decodedToken.id || request.token === null) {
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
        if (
            body.title !== undefined &&
            body.author !== undefined &&
            body.url !== undefined
        ) {
            const savedBook = await book.save()

            user.books = user.books.concat(savedBook._id)
            await user.save()
            response.json(savedBook.toJSON())
        } else {
            response.status(400).send('Bad request. Information missing.')
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

    try {
        await Book.findByIdAndRemove(request.params.id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

booksRouter.put('/:id', async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    const userId = request.params.id

    if (!request.token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    try {
        const book = await Book.findById(request.params.id)
        const userIndex = book.likesbyId.indexOf(request.params.id)

        if (userIndex === -1) {
            // User has not liked the post, add the like
            book.likesbyId.push(userId)
            book.likes += 1
        } else {
            // User has already liked the post, remove the like
            book.likesbyId.pull(userId)
            book.likes -= 1
        }

        book.save()
        response.json(book.toJSON())
    } catch (exception) {
        console.log('exception', exception)
        next(exception)
    }
})

module.exports = booksRouter
