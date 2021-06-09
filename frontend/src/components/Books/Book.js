import React from 'react'
import classes from './Book.module.css'
import PropTypes from 'prop-types'

//

const Book = ({ addNewLike, book, deleteBook, Togglable }) => {
    return (
        <div className={classes.bookStyle}>
            <p>
                <span className={classes.bookTitle}>{book.title}</span> by{' '}
                {book.author}
            </p>

            <Togglable buttonLabel='view'>
                <p>
                    url:{' '}
                    <a
                        href={book.url}
                        target='_blank'
                        rel='noopener noreferrer'
                    >
                        {book.url}
                    </a>
                </p>
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
