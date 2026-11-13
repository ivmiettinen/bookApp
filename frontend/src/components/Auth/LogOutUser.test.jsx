import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';
import LogOutUser from './LogOutUser';
import bookService from '../../services/books';
import { renderWithProviders } from '../../test-utils';

vi.mock('../../services/books', () => ({
    __esModule: true,
    default: { setToken: vi.fn() },
}));

beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
});

test('shows the current user and logs out through the real store', async () => {
    window.localStorage.setItem('loggedBookappUser', JSON.stringify({ token: 'test-token' }));
    const { store } = renderWithProviders(
        <>
            <Route path="/logout"><LogOutUser user={{ user: 'Tester' }} /></Route>
            <Route path="/auth"><p>Authentication page</p></Route>
        </>,
        {
            route: '/logout',
            preloadedState: { user: { user: 'Tester', isAuthenticated: true } },
        }
    );

    expect(screen.getByText('User Tester is currently logged in.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    await waitFor(() => expect(screen.getByText('Authentication page')).toBeInTheDocument());
    expect(store.getState().user).toEqual({ user: null, isAuthenticated: false });
    expect(window.localStorage.getItem('loggedBookappUser')).toBeNull();
    expect(bookService.setToken).toHaveBeenCalledWith(null);
});
