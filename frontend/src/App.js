import React, { useState, useEffect, useRef } from 'react'
import Book from './components/Books/Book'
import bookService from './services/books'
import SuccessMessage from './components/Messages/SuccessMessage'
import loginService from './services/login'
import signUpService from './services/signUp'
import './App.css'
import LoginForm from './components/SignIn/LoginForm'
import Togglable from './components/Togglable'
import BookForm from './components/Books/BookForm'
import ErrorMessage from './components/Messages/ErrorMessage'
import LogOutUser from './components/SignIn/LogOutUser'
import { Switch, Route, Redirect, useHistory } from 'react-router-dom'
import About from './components/About'
import Auth from './components/SignIn/Auth'
import Layout from './components/LayOut/Layout'
import BookHeader from './components/Books/BookHeader'
import Spinner from './components/LayOut/Spinner'

const App = () => {
    const [books, setBooks] = useState([])
    const [user, setUser] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [successMessage, setSuccessMessage] = useState(null)
    const [showSignUp, setShowSignUp] = useState(false)
    const [showLogIn, setShowLogIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        bookService
            .getAll()
            .then((books) => setBooks(books))
            .then(setLoading(false))
            .catch((error) => {
                setLoading({ loading: true })
                console.error('Error on loading books:', error)
            })
    }, [])

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedBookappUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            bookService.setToken(user.token)
        }
    }, [])

    const history = useHistory()

    const bookFormRef = useRef()

    const addBook = async (bookObject) => {
        bookFormRef.current.toggleVisibility()

        try {
            const waitBooks = await bookService.create(bookObject)

            setBooks(books.concat(waitBooks))
            setSuccessMessage(
                `A new book ${waitBooks.title} by ${waitBooks.author} added`
            )
            setTimeout(() => {
                setSuccessMessage(null)
            }, 5000)
        } catch (exception) {
            console.log('exception', exception.message)
            setErrorMessage('You must log in before you can add books')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const addNewLike = async (book) => {
        const findId = books.find((b) => b.id === book)

        const id = findId.id

        const chageBookLikes = { ...findId, likes: findId.likes + 1 }

        try {
            const updateBook = await bookService.update(id, chageBookLikes)
            setBooks(books.map((per) => (per.id !== id ? per : updateBook)))
        } catch (exception) {
            console.log('error on put:', exception)
        }
    }

    const deleteBook = async (del) => {
        const id = del

        const copyOfBooks = [...books]

        const findBook = { ...copyOfBooks.find((a) => a.id === del) }

        const filterById = copyOfBooks.filter((p) => p.id !== id)

        if (window.confirm(`Delete book ${findBook.title} ?`)) {
            try {
                await bookService.remove(id)

                setBooks(filterById)
                setSuccessMessage('The book was successfully deleted')
                setTimeout(() => {
                    setSuccessMessage(null)
                }, 5000)
            } catch (exception) {
                console.log('delete error:', exception.message)
                setErrorMessage(
                    'You can`t remove a book you have not added.',
                    exception
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
        setSuccessMessage('Successfully logged out')
        setTimeout(() => {
            setSuccessMessage(null)
        }, 5000)
    }

    const handleLogin = async (userInfo) => {
        let user
        try {
            if (showSignUp) {
                user = await signUpService.signUp(userInfo)
            } else {
                user = await loginService.login(userInfo)
            }
            window.localStorage.setItem(
                'loggedBookappUser',
                JSON.stringify(user)
            )
            bookService.setToken(user.token)
            setUser(user)
            history.push('/books')
        } catch (exception) {
            console.log('error on login:', exception.message)

            if (JSON.stringify(exception.response.data).includes('unique')) {
                setErrorMessage(
                    `Username '${userInfo.username}' is already in use`
                )

                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
            } else if (
                JSON.stringify(exception.response.data).includes(
                    'invalid username or password'
                )
            ) {
                setErrorMessage('Invalid username or password')

                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
            }
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
                loading={loading}
            />
        ))

    return (
        <Layout user={user}>
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
                    {' '}
                    <LoginForm
                        handleLogin={handleLogin}
                        showSignUp={showSignUp}
                        setErrorMessage={setErrorMessage}
                    />
                </Route>
                <Route path='/signup'>
                    <LoginForm
                        handleLogin={handleLogin}
                        showSignUp={showSignUp}
                        setErrorMessage={setErrorMessage}
                    />
                </Route>

                <Route path='/books'>
                    <BookHeader mapAndSortBooks={mapAndSortBooks} />
                    <Togglable
                        buttonLabel='Add a book'
                        ref={bookFormRef}
                        className='hideWhenVisible'
                    >
                        <BookForm addBook={addBook} />
                    </Togglable>
                    {loading ? (
                        <Spinner loading={loading} />
                    ) : (
                        <>{mapAndSortBooks}</>
                    )}
                </Route>
                <Route path='/about'>
                    <About />
                </Route>
                <Route path='/logout'>
                    <LogOutUser user={user} logOut={logOut} />
                </Route>
            </Switch>
        </Layout>
    )
}

export default App
