import React, { useState, useEffect } from 'react'
import classes from './Book.module.css'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Card from '../UI/Card'
import BookComments from './BookComments'
import Rating from './Rating'

const Book = ({
    addNewLike,
    book,
    user,
    createReview,
    length,
    deleteBook,
    Togglable,
    comments,
}) => {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')

    console.log('comments', comments)

    // const onlyComments = comments.map((p) => p)

    // <p>{book.reviews.map((p) => p)}</p>

    const submitHandler = (e) => {
        e.preventDefault()
        if (comment && rating) {
            createReview({
                rating,
                comment,
                name: user.username,
                id: book.id,
            })
            setComment('')
            setRating('')
        } else {
            alert('Please enter comment and rating')
        }
    }

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
                <div>
                    <h2 id='reviews'>Reviews</h2>
                    {length === 0 && <p> There is no review</p>}
                    <div>
                        <BookComments comments={comments} />
                    </div>
                </div>
                <li>
                    {user === null ? (
                        <div>
                            Please <Link to='/auth'>Sign In</Link> to write a
                            review
                        </div>
                    ) : (
                        <form className='form' onSubmit={submitHandler}>
                            <div>
                                <h2>Write a customer review</h2>
                            </div>
                            <div>
                                <label htmlFor='rating'>Rating</label>
                                <select
                                    id='rating'
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                >
                                    <option value=''>Select...</option>
                                    <option value='1'>1- Poor</option>
                                    <option value='2'>2- Fair</option>
                                    <option value='3'>3- Good</option>
                                    <option value='4'>4- Very good</option>
                                    <option value='5'>5- Excelent</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor='comment'>Comment</label>
                                <textarea
                                    id='comment'
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                ></textarea>
                            </div>
                            <div>
                                <label />
                                <button className='primary' type='submit'>
                                    Submit
                                </button>
                            </div>
                        </form>
                    )}
                </li>

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
