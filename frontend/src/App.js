import React, { useState, useEffect, useRef } from 'react';
import Book from './components/Books/Book';
import bookService from './services/books';
import SuccessMessage from './components/Messages/SuccessMessage';
import loginService from './services/login';
import signUpService from './services/signUp';
import './App.css';
import LoginForm from './components/SignIn/LoginForm';
import Togglable from './components/UI/Togglable';
import BookForm from './components/Books/BookForm';
import ErrorMessage from './components/Messages/ErrorMessage';
import LogOutUser from './components/SignIn/LogOutUser';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import About from './components/LayOut/About';
import Auth from './components/SignIn/Auth';
import Layout from './components/LayOut/Layout';
import BookHeader from './components/Books/BookHeader';
import Spinner from './components/LayOut/Spinner';
import BookOptions from './components/Books/BookOptions';
import {
    createBook,
    sortBooks,
    removeBook,
    addLike,
    initializeBooks,
} from '../src/components/reducers/bookReducer';
import { useDispatch, useSelector } from 'react-redux';

const App = () => {
    const [user, setUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showSignUp, setShowSignUp] = useState(false);
    const [showLogIn, setShowLogIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const dispatch = useDispatch();

    const books = useSelector((state) => state.books);

    useEffect(() => {
        dispatch(initializeBooks())
            .then(setLoading(false))
            .catch((error) => {
                setLoading(true);
                console.error('Error on loading books:', error);
            });
    }, [dispatch]);

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedBookappUser');
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON);
            setUser(user);
            bookService.setToken(user.token);
        }
    }, []);

    const sortArray = (type) => {
        dispatch(sortBooks(type));
    };

    const history = useHistory();

    const bookFormRef = useRef();

    const addBook = async (bookObject) => {
        bookFormRef.current.toggleVisibility();

        try {
            const waitBooks = await bookService.create(bookObject);
            dispatch(createBook(waitBooks));
            setSuccessMessage(
                `A new book ${waitBooks.title} by ${waitBooks.author} added`
            );
            setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
        } catch (exception) {
            console.log('exception', exception.message);
            setErrorMessage('You must log in before you can add books');
            setTimeout(() => {
                setErrorMessage(null);
            }, 5000);
        }
    };

    const addNewLike = async (book) => {
        const bookId = books.find((b) => b.id === book);

        const id = bookId.id;

        const changeBookLikes = { ...bookId, likes: bookId.likes + 1 };

        try {
            const updateBook = await bookService.update(id, changeBookLikes);
            dispatch(addLike(updateBook));
        } catch (exception) {
            console.log('error on put:', exception);
        }
    };

    const deleteBook = async (del) => {
        const id = del;

        const findBook = books.find((a) => a.id === del);

        if (window.confirm(`Delete book ${findBook.title} ?`)) {
            try {
                const waitBooks = await bookService.remove(id);
                console.log('waitBooks: ', waitBooks);
                dispatch(removeBook(id));
                setSuccessMessage(
                    `The book ${findBook.title}was successfully deleted`
                );

                setTimeout(() => {
                    setSuccessMessage(null);
                }, 5000);
            } catch (exception) {
                console.log('delete error:', exception.message);
                setErrorMessage(
                    'You can`t remove a book you have not added.',
                    exception
                );
                setTimeout(() => {
                    setErrorMessage(null);
                }, 5000);
            }
        }
    };

    const logOut = () => {
        window.localStorage.clear();
        bookService.setToken(null);
        setUser(null);
        setShowSignUp(false);
        setShowLogIn(false);
        setSuccessMessage('Successfully logged out');
        setTimeout(() => {
            setSuccessMessage(null);
        }, 5000);
    };

    const handleLogin = async (userInfo) => {
        let user;
        try {
            if (showSignUp) {
                user = await signUpService.signUp(userInfo);
            } else {
                user = await loginService.login(userInfo);
            }
            window.localStorage.setItem(
                'loggedBookappUser',
                JSON.stringify(user)
            );
            bookService.setToken(user.token);
            setUser(user);
            history.push('/books');
        } catch (exception) {
            console.log('error on login:', exception.message);

            if (JSON.stringify(exception.response.data).includes('unique')) {
                setErrorMessage(
                    `Username '${userInfo.username}' is already in use`
                );

                setTimeout(() => {
                    setErrorMessage(null);
                }, 5000);
            } else if (
                JSON.stringify(exception.response.data).includes(
                    'invalid username or password'
                )
            ) {
                setErrorMessage('Invalid username or password');

                setTimeout(() => {
                    setErrorMessage(null);
                }, 5000);
            }
        }
    };

    return (
        <Layout user={user}>
            <SuccessMessage successMessage={successMessage} />
            <ErrorMessage errorMessage={errorMessage} />
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/auth"></Redirect>
                </Route>
                <Route path="/auth">
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
                <Route path="/login">
                    {' '}
                    <LoginForm
                        handleLogin={handleLogin}
                        showSignUp={showSignUp}
                        setErrorMessage={setErrorMessage}
                    />
                </Route>
                <Route path="/signup">
                    <LoginForm
                        handleLogin={handleLogin}
                        showSignUp={showSignUp}
                        setErrorMessage={setErrorMessage}
                    />
                </Route>

                <Route path="/books">
                    <div className="headerNsort">
                        <BookHeader />
                        <BookOptions sortArray={sortArray} />
                    </div>
                    <Togglable
                        buttonLabel="Add a book"
                        ref={bookFormRef}
                        className="hideWhenVisible"
                    >
                        <BookForm addBook={addBook} />
                    </Togglable>
                    {loading ? (
                        <Spinner loading={loading} />
                    ) : (
                        <>
                            <Book
                                Togglable={Togglable}
                                deleteBook={deleteBook}
                                addNewLike={addNewLike}
                            />
                        </>
                    )}
                </Route>
                <Route path="/about">
                    <About />
                </Route>
                <Route path="/logout">
                    <LogOutUser user={user} logOut={logOut} />
                </Route>
            </Switch>
        </Layout>
    );
};

export default App;
