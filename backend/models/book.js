const mongoose = require('mongoose');

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

module.export = Book;
