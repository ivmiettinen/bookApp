import React from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import bookReducer from './store/book-slice';
import uiReducer from './store/ui-slice';
import userReducer from './store/user-slice';

export const renderWithProviders = (ui, { route = '/', preloadedState } = {}) => {
    const store = configureStore({
        reducer: { books: bookReducer, ui: uiReducer, user: userReducer },
        preloadedState,
    });

    return {
        store,
        ...render(
            <MemoryRouter initialEntries={[route]}>
                <Provider store={store}>{ui}</Provider>
            </MemoryRouter>
        ),
    };
};
