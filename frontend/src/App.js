import React, { useState, useEffect } from 'react';
import { Switch, Route, Redirect} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import Book from './components/Books/Book';
import AuthForm from './components/Auth/AuthForm';
import BookForm from './components/Books/BookForm';
import LogOutUser from './components/Auth/LogOutUser';
import About from './components/LayOut/About';
import AuthButtons from './components/Auth/AuthButtons';
import Layout from './components/LayOut/Layout';
import BookHeader from './components/Books/BookHeader';
import Spinner from './components/LayOut/Spinner';
import BookOptions from './components/Books/BookOptions';
import Notification from './components/UI/Notification';
import {
    initializeBooks,
} from './store/book-slice';

const App = () => {
    const [showSignUp, setShowSignUp] = useState(false);
    const [showLogIn, setShowLogIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const notification = useSelector((state) => state.ui.notification);
    const user = useSelector((state) => state.user);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(initializeBooks())
            .then(setLoading(false))
            .catch((error) => {
                setLoading(true);
                console.error('Error on loading books:', error);
            });
    }, [dispatch]);

    return (
        <Layout>
            {notification && (
                <Notification
                    status={notification.status}
                    message={notification.message}
                />
            )}
            <Switch>
                <Route path="/" exact>
                    <Redirect  to="/auth"></Redirect>
                </Route>
                <Route path="/auth">
                    {!showSignUp || !showLogIn ? (
                        <AuthButtons
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
                    <AuthForm
                        showSignUp={showSignUp}
                    />
                </Route>
                <Route path="/signup">
                    <AuthForm
                        showSignUp={showSignUp}/>
                </Route>
                <Route path="/books">
                    <div className="headerNsort">
                        <BookHeader />
                        <BookOptions />
                    </div>
                    <BookForm />
                    {loading ? (
                        <Spinner loading={loading} />
                    ) : (
                        <Book />
                    )}
                </Route>
                <Route path="/about">
                    <About />
                </Route>
                <Route path="/logout">
                    <LogOutUser user={user} />
                </Route>
            </Switch>
        </Layout>
    );
};

export default App;
