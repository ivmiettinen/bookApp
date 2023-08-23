import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import bookReducer from '../src/store/bookReducer';
import uiSlice from '../src/store/ui-slice';

const store = configureStore({
    reducer: {
        books: bookReducer,
        ui: uiSlice.reducer
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
