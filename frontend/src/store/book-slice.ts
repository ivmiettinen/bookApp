import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import bookService from '../services/books';
import type { Book } from '../types/api';
import type { AppThunk } from './index';

export type SortKey = 'title' | 'author' | 'likes';

export const isSortKey = (value: string): value is SortKey =>
    value === 'title' || value === 'author' || value === 'likes';

export interface BooksState {
    items: Book[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: BooksState = { items: [], status: 'idle', error: null };

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
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

export const initializeBooks = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    if (getState().books.status === 'loading') return;

    dispatch(bookSlice.actions.loadingBooks());
    try {
        const books = await bookService.getAll();
        dispatch(bookSlice.actions.replaceBooks(books));
    } catch {
        // Store the loading error in Redux so App can display it and offer a retry.
        dispatch(bookSlice.actions.loadingBooksFailed('Could not load books. Please try again.'));
    }
};

export const { createBook, sortBooks, removeBook, addLike } = bookSlice.actions;
export default bookSlice.reducer;
