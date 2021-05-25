import React, { useRef } from 'react'
import classes from './BookForm.module.css'
import PropTypes from 'prop-types'
import Button from '../UI/Button'

const BookForm = ({ addBook }) => {
    const titleInputRef = useRef()
    const authorInputRef = useRef()
    const urlInputRef = useRef()

    const createBook = (e) => {
        e.preventDefault()

        addBook({
            title: titleInputRef.current.value,
            author: authorInputRef.current.value,
            url: urlInputRef.current.value,
        })
        titleInputRef.current.value = ''
        authorInputRef.current.value = ''
        urlInputRef.current.value = ''
    }

    return (
        <div className={classes.BookFormStyle}>
            <h2>Create a new book</h2>

            <form onSubmit={createBook}>
                <p>
                    <label>title:</label>
                    <br />
                    <input
                        type='text'
                        id='title'
                        required
                        ref={titleInputRef}
                    />
                </p>

                <p>
                    <label>author:</label>
                    <br />
                    <input
                        type='text'
                        id='author'
                        required
                        ref={authorInputRef}
                    />
                </p>

                <label>url:</label>
                <br />
                <input type='url' id='url' required ref={urlInputRef} />
                <br />

                <Button className={classes.bookFormButton} type='submit'>create</Button>
            </form>
        </div>
    )
}

BookForm.propTypes = {
    addBook: PropTypes.func.isRequired,
}

export default BookForm
