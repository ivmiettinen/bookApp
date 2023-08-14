import { createSlice } from '@reduxjs/toolkit';
import bookService from '../services/books';

const bookSlice = createSlice({
    name: 'books',
    initialState: [],
    reducers: {
        createBook(state, action) {
            state.push(action.payload);
        },
        removeBook(state, action) {
            return state.filter((item) => item.id !== action.payload);
        },
        sortBooks(state, action) {
            const sortTypes = {
                title: 'title',
                author: 'author',
                likes: 'likes',
            };

            const sortWith = sortTypes[action.payload];

            if (sortWith === 'likes') {
                state.sort((a, b) => b[sortWith] - a[sortWith]);
            } else {
                state.sort((a, b) =>
                    a[sortWith]
                        .toLowerCase()
                        .localeCompare(b[sortWith].toLowerCase())
                );
            }
        },
        addLike(state, action) {
            return state.map((book) =>
                book.id !== action.payload.id ? book : action.payload
            );
        },
    },
});

export const initializeBooks = () => {
    return async (dispatch) => {
        const books = await bookService.getAll();
        books.forEach((book) => dispatch(createBook(book)));
    };
};

export const { createBook, sortBooks, removeBook, addLike } = bookSlice.actions;

export default bookSlice.reducer;
