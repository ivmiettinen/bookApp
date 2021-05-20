import React, { useState } from 'react'
import Button from './UI/Button'

const BookForm = ({ addBook }) => {
    const [newTitle, setNewTitle] = useState('')
    const [newAuthor, setNewAuthor] = useState('')
    const [newUrl, setNewUrl] = useState('')

    const createBook = (e) => {
        e.preventDefault()

        addBook({
            title: newTitle,
            author: newAuthor,
            url: newUrl,
        })

        setNewTitle('')
        setNewAuthor('')
        setNewUrl('')
    }

    return (
        <div>
            <h2>Create a new book</h2>

            <form onSubmit={createBook}>
                title:{' '}
                <input
                    value={newTitle}
                    onChange={({ target }) => setNewTitle(target.value)}
                />
                <br />
                author:{' '}
                <input
                    value={newAuthor}
                    onChange={({ target }) => setNewAuthor(target.value)}
                />
                <br />
                url:{' '}
                <input
                    value={newUrl}
                    onChange={({ target }) => setNewUrl(target.value)}
                />
                <br />
                <Button type='submit'>create</Button>
            </form>
        </div>
    )
}

export default BookForm
