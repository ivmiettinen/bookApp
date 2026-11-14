import type { ReactElement } from 'react';
import type { PreloadedState } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { setupStore } from './store';
import type { RootState } from './store';

interface RenderOptions {
    route?: string;
    preloadedState?: PreloadedState<RootState>;
}

export const renderWithProviders = (ui: ReactElement, { route = '/', preloadedState }: RenderOptions = {}) => {
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
