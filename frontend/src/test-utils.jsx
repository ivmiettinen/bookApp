import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { setupStore } from './store';

/**
 * @typedef {import('react').ReactElement} ReactElement
 * @typedef {import('./store').RootState} RootState
 * @typedef {import('@reduxjs/toolkit').PreloadedState<RootState>} InitialState
 */

/**
 * @typedef {object} RenderOptions
 * @property {string} [route]
 * @property {InitialState} [preloadedState]
 */

/**
 * @param {ReactElement} ui
 * @param {RenderOptions} [options]
 */
export const renderWithProviders = (ui, { route = '/', preloadedState } = {}) => {
    const store = setupStore(preloadedState);

    return {
        store,
        ...render(
            <MemoryRouter initialEntries={[route]}>
                <Provider store={store}>{ui}</Provider>
            </MemoryRouter>
        ),
    };
};
