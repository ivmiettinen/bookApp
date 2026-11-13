import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import bookService from '../services/books';
import type { Book } from '../types/api';
import type { AppThunk } from './index';

export type SortKey = 'title' | 'author' | 'likes';

export const isSortKey = (value: string): value is SortKey =>
    value === 'title' || value === 'author' || value === 'likes';

const initialState: Book[] = [];

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        createBook(state, action: PayloadAction<Book>) {
            state.push(action.payload);
        },
        removeBook(state, action: PayloadAction<Book['id']>) {
            return state.filter((item) => item.id !== action.payload);
        },
        sortBooks(state, action: PayloadAction<SortKey>) {
            const sortWith = action.payload;
            if (sortWith === 'likes') {
                state.sort((a, b) => Number(b.likes) - Number(a.likes));
            } else {
                state.sort((a, b) =>
                    a[sortWith].toLowerCase().localeCompare(b[sortWith].toLowerCase())
                );
            }
        },
        addLike(state, action: PayloadAction<Book>) {
            return state.map((book) =>
                book.id !== action.payload.id ? book : action.payload
            );
        },
    },
});

export const initializeBooks = (): AppThunk<Promise<void>> => async (dispatch) => {
    const books = await bookService.getAll();
    books.forEach((book) => dispatch(createBook(book)));
};

export const { createBook, sortBooks, removeBook, addLike } = bookSlice.actions;
export default bookSlice.reducer;
