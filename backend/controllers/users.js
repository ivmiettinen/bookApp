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

    if (body.password.length < 8) {
        return response.status(400).json({
            error: 'password must be 8 letters or longer',
        })
    }

    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        email: body.email,
        passwordHash,
    })

    //Create and sign a token:

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(userForToken, process.env.SECRET, {
        expiresIn: 60*60 ,
    })

    try {
        await user.save()
        response
            .status(201)
            .send({ token, username: user.username, email: user.email })
    } catch (exception) {
        next(exception)
    }
})

module.exports = usersRouter
