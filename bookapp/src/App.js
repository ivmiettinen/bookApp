import React, { useState, useEffect, useRef } from 'react'
import Book from './components/Book'
import bookService from './services/books'
import SuccessMessage from './components/SuccessMessage'
import loginService from './services/login'
import './App.css'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import BookForm from './components/BookForm'
import ErrorMessage from './components/ErrorMessage'

const App = () => {
    const [books, setBooks] = useState([])
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)

    useEffect(() => {
        bookService.getAll().then((books) => setBooks(books))
    }, [])

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedBookappUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            bookService.setToken(user.token)
        }
    }, [])

    const bookFormRef = useRef()

    const addBook = (bookObject) => {
        bookFormRef.current.toggleVisibility()

        bookService
            .create(bookObject)
            .then((returnedBook) => {
                setBooks(books.concat(returnedBook))

                setSuccessMessage(
                    `A new blog ${bookObject.title} by ${bookObject.author} added`
                )
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 5000)
            })
            .catch((error) => {
                console.log('error', error)
            })
    }

    const addNewLike = (book) => {
        const findId = books.find((b) => b.id === book)

        const id = findId.id

        const chageBookLikes = { ...findId, likes: findId.likes + 1 }

        bookService
            .update(id, chageBookLikes)
            .then((returnedBook) => {
                setBooks(
                    books.map((per) => (per.id !== id ? per : returnedBook))
                )
            })
            .catch((error) => {
                console.log('error on put:', error)
            })
    }

    const deleteBook = (del) => {
        const id = del

        const copyOfBooks = [...books]

        const findBook = { ...copyOfBooks.find((a) => a.id === del) }

        const filterById = copyOfBooks.filter((p) => p.id !== id)

        if (window.confirm(`Delete book ${findBook.title} ?`)) {
            bookService
                .remove(id)
                .then(() => {
                    setBooks(filterById)
                    setSuccessMessage('the book was successfully deleted')
                    setTimeout(() => {
                        setSuccessMessage(null)
                    }, 5000)
                })
                .catch((error) => {
                    console.log('delete error:', error)
                    setErrorMessage(
                        'You can`t remove a book you have not added.',
                        error
                    )
                    setTimeout(() => {
                        setErrorMessage(null)
                    }, 5000)
                })
        }
    }

    const logOut = () => {
        window.localStorage.clear()
        setUser(null)
    }

    const handleLogin = async (event) => {
        event.preventDefault()

        try {
            const user = await loginService.login({
                username,
                password,
            })

            window.localStorage.setItem(
                'loggedBookappUser',
                JSON.stringify(user)
            )

            bookService.setToken(user.token)
            setUser(user)

            setUser(user)
            setUsername('')
            setPassword('')
        } catch (exception) {
            console.log('error on put:', exception)
            setErrorMessage('Wrong username or password')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const loginForm = () => (
        <LoginForm
            username={username}
            password={password}
            setUsername={setUsername}
            setPassword={setPassword}
            handleLogin={handleLogin}
        />
    )

    return (
        <div>
            <h1>Books</h1>

            <SuccessMessage successMessage={successMessage} />
            <ErrorMessage errorMessage={errorMessage} />

            {user === null ? (
                loginForm()
            ) : (
                <div>
                    <div>
                        <p>
                            {user.name} logged in
                            <button onClick={logOut}>Log out</button>
                        </p>
                    </div>
                    <Togglable buttonLabel='new book' ref={bookFormRef}>
                        <BookForm addBook={addBook} />
                    </Togglable>

                    <ul>
                        {books
                            .sort((a, b) => b.likes - a.likes)
                            .map((book) => (
                                <Book
                                    key={book.id}
                                    book={book}
                                    Togglable={Togglable}
                                    deleteBook={deleteBook}
                                    addNewLike={addNewLike}
                                />
                            ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default App
