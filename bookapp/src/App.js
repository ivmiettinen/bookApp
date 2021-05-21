import React, { useState, useEffect, useRef } from 'react'
import Book from './components/Book'
import bookService from './services/books'
import SuccessMessage from './components/Messages/SuccessMessage'
import loginService from './services/login'
import signUpService from './services/signUp'
import './App.css'
import LoginForm from './components/SignIn/LoginForm'
import Togglable from './components/Togglable'
import BookForm from './components/BookForm'
import ErrorMessage from './components/Messages/ErrorMessage'
import LoggedInUser from './components/SignIn/LoggedInUser'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
} from 'react-router-dom'
import MainHeader from './components/LayOut/MainHeader'
import About from './components/About'
import Auth from './components/SignIn/Auth'

const App = () => {
    const [books, setBooks] = useState([])
    const [user, setUser] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [showSignUp, setShowSignUp] = useState(false)
    const [showLogIn, setShowLogIn] = useState(false)

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

        try {
            bookService.create(bookObject).then((returnedBook) => {
                setBooks(books.concat(returnedBook))

                setSuccessMessage(
                    `A new book ${bookObject.title} by ${bookObject.author} added`
                )
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 5000)
            })
        } catch (error) {
            console.log('error', error)
            setErrorMessage('You must log in before you can add books')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const addNewLike = (book) => {
        const findId = books.find((b) => b.id === book)

        const id = findId.id

        const chageBookLikes = { ...findId, likes: findId.likes + 1 }

        try {
            bookService.update(id, chageBookLikes).then((returnedBook) => {
                setBooks(
                    books.map((per) => (per.id !== id ? per : returnedBook))
                )
            })
        } catch (exception) {
            console.log('error on put:', exception)
        }
    }

    const deleteBook = (del) => {
        const id = del

        const copyOfBooks = [...books]

        const findBook = { ...copyOfBooks.find((a) => a.id === del) }

        const filterById = copyOfBooks.filter((p) => p.id !== id)

        if (window.confirm(`Delete book ${findBook.title} ?`)) {
            try {
                bookService.remove(id).then(() => {
                    setBooks(filterById)
                    setSuccessMessage('the book was successfully deleted')
                    setTimeout(() => {
                        setSuccessMessage(null)
                    }, 5000)
                })
            } catch (error) {
                console.log('delete error:', error)
                setErrorMessage(
                    'You can`t remove a book you have not added.',
                    error
                )
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
            }
        }
    }

    const logOut = () => {
        window.localStorage.clear()
        bookService.setToken(null)
        setUser(null)
        setShowSignUp(false)
        setShowLogIn(false)
    }

    const handleLogin = async (userInfo) => {
        console.log('HANDLELOGIN EVENT', userInfo)

        let user

        try {
            if (showSignUp) {
                user = await signUpService.signUp(userInfo)
            } else {
                user = await loginService.login(userInfo)
            }

            // console.log('handleLogin user', user)
            window.localStorage.setItem(
                'loggedBookappUser',
                JSON.stringify(user)
            )
            bookService.setToken(user.token)
            setUser(user)
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

    return (
        <div>
            <Router>
                <MainHeader />
                <SuccessMessage successMessage={successMessage} />
                <ErrorMessage errorMessage={errorMessage} />
                <Switch>
                    <Route path='/' exact>
                        <Redirect to='/auth'></Redirect>
                    </Route>
                    <Route path='/auth'>
                        {!showSignUp || !showLogIn ? (
                            <Auth
                                showSignUp={setShowSignUp}
                                setShowLogIn={setShowLogIn}
                                setShowSignUp={setShowSignUp}
                            />
                        ) : (
                            <></>
                        )}
                    </Route>
                    <Route path='/login'>
                        <LoginForm
                            handleLogin={handleLogin}
                            showSignUp={showSignUp}
                        />
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
                        <About />
                    </Route>
                </Switch>
            </Router>
        </div>
    )
}

export default App
