import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import bookSlice from './store/book-slice';
import uiSlice from './store/ui-slice';
import userSlice from './store/user-slice';

const store = configureStore({
    reducer: {
        books: bookSlice,
        ui: uiSlice,
        user: userSlice
    },
});

const root = createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>
);
