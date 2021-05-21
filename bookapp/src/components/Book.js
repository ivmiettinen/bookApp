import React from 'react'
import PropTypes from 'prop-types'

const bookStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
}

const titleAndAuthor = {
    color: '#3CB371',
    fontWeight: 'bold',
}

const Book = ({ addNewLike, book, deleteBook, Togglable }) => {
    return (
        <div style={bookStyle}>
            <p style={titleAndAuthor}>
                {book.title} by {book.author}
            </p>

            <Togglable buttonLabel='view'>
                <p>url: {book.url} </p>
                <p>likes: {book.likes} </p>

                <p>
                    <button
                        type='newLike'
                        value={book.title}
                        name='newLike'
                        onClick={() => addNewLike(book.id)}
                    >
                        like
                    </button>
                </p>
                <p>
                    <button
                        type='deleteBook'
                        value={book.id}
                        name='deleteBook'
                        onClick={() => deleteBook(book.id)}
                    >
                        delete
                    </button>
                </p>
            </Togglable>
        </div>
    )
}

Book.propTypes = {
    addNewLike: PropTypes.func.isRequired,
    book: PropTypes.object.isRequired,
    deleteBook: PropTypes.func.isRequired,
    Togglable: PropTypes.object.isRequired,
}

export default Book
