import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import type { Book, CreateBookInput } from '../types/api';
import type { TogglableHandle } from '../types/ui';
import bookService from '../services/books';
import { uiActions } from './ui-slice';
import { createBook, removeBook } from './book-slice';

const useBookActions = () => {
    const dispatch = useAppDispatch();
    const books = useAppSelector((state) => state.books.items);

    const bookFormRef = useRef<TogglableHandle>(null);

    const addBook = async (book: CreateBookInput): Promise<void> => {
        bookFormRef.current?.toggleVisibility();

        try {
            const waitBooks = await bookService.create(book);
            dispatch(createBook(waitBooks));
            dispatch(
                uiActions.showNotification({
                    status: 'success',
                    message: `A new book ${waitBooks.title} by ${waitBooks.author} added`,
                }));
        }
        catch {
            dispatch(
                uiActions.showNotification({
                    status: 'error',
                    message: 'You must log in before you can add books',
                }));
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
            } catch {
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

export default useBookActions;

