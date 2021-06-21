const mongoose = require('mongoose')

mongoose.set('useFindAndModify', false)

const reviewSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        comment: { type: String, required: true },
        rating: { type: Number, required: true },
        creatorId: { type: String, required: true },
    },
    { timestamps: true }
)

const bookSchema = new mongoose.Schema({
    id: Number,
    title: String,
    author: String,
    url: String,
    likes: Number,
    numReviews: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviews: [reviewSchema],
})













bookSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    },
})

module.exports = mongoose.model('Book', bookSchema)
