const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response, next) => {
    const body = request.body

    const saltRounds = 10

    if (body.password === undefined) {
        return response.status(400).json({
            error: 'password must be included in your post',
        })
    }

    if (body.password.length < 3) {
        return response.status(400).json({
            error: 'password must be 3 letters or longer',
        })
    }

    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    //Create and sign a token:

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET)

    try {
        await user.save()
        response
            .status(201)
            .send({ token, username: user.username, name: user.name })
    } catch (exception) {
        next(exception)
    }
})

usersRouter.get('/', async (request, response, next) => {
    try {
        const allUsers = await User.find({}).populate('books', {
            url: 1,
            title: 1,
            author: 1,
        })

        if (allUsers) {
            response.json(allUsers.map((r) => r.toJSON()))
        } else {
            response.status(404).end()
        }
    } catch (exception) {
        next(exception)
    }
})

module.exports = usersRouter
