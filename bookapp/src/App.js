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
import LoggedInUser from './components/LoggedInUser'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import MainHeader from './components/MainHeader'
import About from './components/About'

const App = () => {
    const [books, setBooks] = useState([])
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [user, setUser] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [showForm, setShowForm] = useState(null)

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
                    `A new book ${bookObject.title} by ${bookObject.author} added`
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

    const mapAndSortBooks = books
        .sort((a, b) => b.likes - a.likes)
        .map((book) => (
            <Book
                key={book.id}
                book={book}
                Togglable={Togglable}
                deleteBook={deleteBook}
                addNewLike={addNewLike}
            />
        ))

    const showLoginForm = () => {
        setShowForm('login')
    }

    return (
        <div>
            <Router>
                <MainHeader />
                <SuccessMessage successMessage={successMessage} />
                <ErrorMessage errorMessage={errorMessage} />
                <Switch>
                    <Route path='/' exact>
                        <Redirect to='/login'></Redirect>
                    </Route>
                    <Route path='/login'>
                        {user === null ? (
                            <>
                                <button onClick={showLoginForm}>Login</button>
                                <LoginForm
                                    user={user}
                                    username={username}
                                    password={password}
                                    setUsername={setUsername}
                                    setPassword={setPassword}
                                    handleLogin={handleLogin}
                                />
                            </>
                        ) : (
                            <Redirect from='/login' to='/books' />
                        )}
                    </Route>
                    <Route path='/books'>
                        <div>
                            <LoggedInUser user={user} logOut={logOut} />
                            <Togglable
                                buttonLabel='Add a book'
                                ref={bookFormRef}
                            >
                                <BookForm addBook={addBook} />
                            </Togglable>
                            <ul>{mapAndSortBooks}</ul>
                        </div>
                    </Route>
                    <Route path='/about'>
                        <About/>
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}

export default App
