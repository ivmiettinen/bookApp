import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import Button from './UI/Button'

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
        <div>
            <h2>Create a new book</h2>

            <form onSubmit={createBook}>
                title:{' '}
                <input type='text' id='title' required ref={titleInputRef} />
                <br />
                author:{' '}
                <input type='text' id='author' required ref={authorInputRef} />
                <br />
                url: <input type='url' id='url' required ref={urlInputRef} />
                <br />
                <Button type='submit'>create</Button>
            </form>
        </div>
    )
}

BookForm.propTypes = {
    addBook: PropTypes.func.isRequired,
}

export default BookForm
