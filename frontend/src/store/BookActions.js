import { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import bookService from '../services/books';
import { uiActions } from './ui-slice';
import { createBook, removeBook } from './book-slice';

const BookActions = () => {

    // const DeleteBookButton = ({ book, onSuccess, onError }) => {
    const dispatch = useDispatch();
    const books = useSelector((state) => state.books);

    const bookFormRef = useRef();

    const addBook = async (book) => {
        bookFormRef.current.toggleVisibility();

        try {
            const waitBooks = await bookService.create(book);
            dispatch(createBook(waitBooks));
            dispatch(
                uiActions.showNotification({
                    status: 'success',
                    message: `A new book ${waitBooks.title} by ${waitBooks.author} added`,
                }));
        }
        catch (exception) {
            dispatch(
                uiActions.showNotification({
                    status: 'error',
                    message: 'You must log in before you can add books',
                }));
            // console.log('exception', exception.message);
        }
    };

    const deleteBook = async (id) => {
        const findBook = books.find((a) => a.id === id);

        if (window.confirm(`Delete book ${findBook.title} ?`)) {
            try {
                await bookService.remove(id);
                dispatch(removeBook(id));
                dispatch(
                    uiActions.showNotification({
                        status: 'success',
                        message: `The book ${findBook.title} was successfully deleted`,
                    }));
            } catch (exception) {
                dispatch(
                    uiActions.showNotification({
                        status: 'error',
                        message: 'You can`t remove a book you have not added!',
                    }));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return {
        addBook, deleteBook, bookFormRef
    };
};

export default BookActions;