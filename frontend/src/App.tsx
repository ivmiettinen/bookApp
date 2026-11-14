import { useEffect } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
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
    const { items: books, status, error } = useAppSelector((state) => state.books);

    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(initializeBooks());
    }, [dispatch]);

    return (
        <Layout>
            <Notification />
            <Switch>
                <Route path="/" exact>
                    <Redirect to="/auth"></Redirect>
                </Route>
                <Route path="/auth">
                    <AuthButtons />
                </Route>
                <Route path="/login">
                    <AuthForm mode="login" />
                </Route>
                <Route path="/signup">
                    <AuthForm mode="signup" />
                </Route>
                <Route path="/books">
                    <div className="headerNsort">
                        <BookHeader />
                        <BookOptions />
                    </div>
                    <BookForm />
                    {(status === 'idle' || status === 'loading') && (
                        <div role="status"><Spinner loading={true} /></div>
                    )}
                    {status === 'failed' && (
                        <div role="alert">
                            <p>{error}</p>
                            <button type="button" onClick={() => dispatch(initializeBooks())}>
                                Try again
                            </button>
                        </div>
                    )}
                    {status === 'succeeded' && (
                        books.length === 0 ? <p>No books yet.</p> : <Book />
                    )}
                </Route>
                <Route path="/about">
                    <About />
                </Route>
                <Route path="/logout">
                    <LogOutUser />
                </Route>
            </Switch>
        </Layout>
    );
};

export default App;
