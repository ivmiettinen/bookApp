import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import bookService from '../services/books';
import type { Book } from '../types/api';
import type { AppThunk } from './index';
import { handleSessionError } from '../services/session';
import { bookErrorMessage } from '../services/bookErrors';
import { uiActions } from './ui-slice';

export type SortKey = 'title' | 'author' | 'likes';

export const isSortKey = (value: string): value is SortKey =>
    value === 'title' || value === 'author' || value === 'likes';

export interface BooksState {
    items: Book[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
    pendingLikeIds: Book['id'][];
}

const initialState: BooksState = { items: [], status: 'idle', error: null, pendingLikeIds: [] };

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        likeStarted(state, action: PayloadAction<Book['id']>) {
            state.pendingLikeIds.push(action.payload);
        },
        likeFinished(state, action: PayloadAction<Book['id']>) {
            state.pendingLikeIds = state.pendingLikeIds.filter((id) => id !== action.payload);
        },
        loadingBooks(state) {
            state.status = 'loading';
            state.error = null;
        },
        replaceBooks(state, action: PayloadAction<Book[]>) {
            state.items = action.payload;
            state.status = 'succeeded';
            state.error = null;
        },
        loadingBooksFailed(state, action: PayloadAction<string>) {
            state.status = 'failed';
            state.error = action.payload;
        },
        createBook(state, action: PayloadAction<Book>) {
            state.items.push(action.payload);
        },
        removeBook(state, action: PayloadAction<Book['id']>) {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        sortBooks(state, action: PayloadAction<SortKey>) {
            const sortWith = action.payload;
            if (sortWith === 'likes') {
                state.items.sort((a, b) => Number(b.likes) - Number(a.likes));
            } else {
                state.items.sort((a, b) =>
                    a[sortWith].toLowerCase().localeCompare(b[sortWith].toLowerCase())
                );
            }
        },
        addLike(state, action: PayloadAction<Book>) {
            state.items = state.items.map((book) =>
                book.id !== action.payload.id ? book : action.payload
            );
        },
    },
});

export const likeBook = (id: Book['id']): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const { items, pendingLikeIds } = getState().books;
    const book = items.find((item) => item.id === id);
    if (!book || pendingLikeIds.includes(id)) return;

    // Redux owns the lock so repeated dispatches and remounted controls share it.
    dispatch(bookSlice.actions.likeStarted(id));
    try {
        const updated = await bookService.update(id, { likes: (book.likes ?? 0) + 1 });
        dispatch(bookSlice.actions.addLike(updated));
    } catch (error: unknown) {
        if (!dispatch(handleSessionError(error, 'You must log in before you can like books'))) {
            dispatch(uiActions.showNotification({ status: 'error', message: bookErrorMessage(error, 'like') }));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    } finally {
        dispatch(bookSlice.actions.likeFinished(id));
    }
};

export const initializeBooks = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    if (getState().books.status === 'loading') return;

    dispatch(bookSlice.actions.loadingBooks());
    try {
        const books = await bookService.getAll();
        dispatch(bookSlice.actions.replaceBooks(books));
    } catch (error: unknown) {
        dispatch(handleSessionError(error));
        // Store the loading error in Redux so App can display it and offer a retry.
        dispatch(bookSlice.actions.loadingBooksFailed('Could not load books. Please try again.'));
    }
};

export const { createBook, sortBooks, removeBook, addLike } = bookSlice.actions;
export default bookSlice.reducer;
