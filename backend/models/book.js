const mongoose = require('mongoose')

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
})

bookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

module.exports = mongoose.model('Book', bookSchema)
