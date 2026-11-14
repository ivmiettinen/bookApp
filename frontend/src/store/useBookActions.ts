import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import type { Book, CreateBookInput } from '../types/api';
import type { TogglableHandle } from '../types/ui';
import bookService from '../services/books';
import { uiActions } from './ui-slice';
import { createBook, removeBook } from './book-slice';
import { handleSessionError } from '../services/session';
import { bookErrorMessage } from '../services/bookErrors';

const useBookActions = () => {
    const dispatch = useAppDispatch();
    const books = useAppSelector((state) => state.books.items);

    const bookFormRef = useRef<TogglableHandle>(null);

    const addingRef = useRef(false);
    const [isAdding, setIsAdding] = useState(false);

    const addBook = async (book: CreateBookInput): Promise<boolean> => {
        if (addingRef.current) return false;
        addingRef.current = true;
        setIsAdding(true);

        try {
            const waitBooks = await bookService.create(book);
            dispatch(createBook(waitBooks));
            dispatch(
                uiActions.showNotification({
                    status: 'success',
                    message: `A new book ${waitBooks.title} by ${waitBooks.author} added`,
                }));
            bookFormRef.current?.toggleVisibility();
            return true;
        }
        catch (error: unknown) {
            if (dispatch(handleSessionError(error, 'You must log in before you can add books'))) return false;
            dispatch(
                uiActions.showNotification({
                    status: 'error',
                    message: bookErrorMessage(error, 'add'),
                }));
            return false;
        } finally {
            addingRef.current = false;
            setIsAdding(false);
        }
    };

    const deleteBook = async (id: Book['id']): Promise<void> => {
        const findBook = books.find((a) => a.id === id);

        if (!findBook) return;

        if (window.confirm(`Delete book ${findBook.title} ?`)) {
            try {
                await bookService.remove(id);
                dispatch(removeBook(id));
                dispatch(
                    uiActions.showNotification({
                        status: 'success',
                        message: `The book ${findBook.title} was successfully deleted`,
                    }));
            } catch (error: unknown) {
                if (dispatch(handleSessionError(error, 'You must log in before you can remove books'))) return;
                dispatch(
                    uiActions.showNotification({
                        status: 'error',
                        message: bookErrorMessage(error, 'remove'),
                    }));
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return {
        addBook, deleteBook, bookFormRef, isAdding
    };
};

export default useBookActions;

