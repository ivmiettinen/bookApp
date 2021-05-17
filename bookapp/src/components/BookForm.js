import React, { useState } from 'react'

const BookForm = ({ addBook }) => {
    const [newTitle, setNewTitle] = useState('')
    const [newAuthor, setNewAuthor] = useState('')
    const [newUrl, setNewUrl] = useState('')

    const createBlog = (e) => {
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
            <h2>Create a new blog</h2>

            <form onSubmit={createBlog}>
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
                <button type='submit'>create</button>
            </form>
        </div>
    )
}

export default BookForm
