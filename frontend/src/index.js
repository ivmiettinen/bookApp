import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import bookSlice from './store/book-slice';
import uiSlice from '../src/store/ui-slice';
import userSlice from '../src/store/user-slice';

const store = configureStore({
    reducer: {
        books: bookSlice,
        ui: uiSlice,
        user: userSlice
    },
});

ReactDOM.render(
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>,
    document.getElementById('root')
);
