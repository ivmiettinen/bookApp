import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { Route } from 'react-router-dom';
import LogOutUser from './LogOutUser';
import bookService from '../../services/books';
import { renderWithProviders } from '../../test-utils';
import { login, logout } from '../../store/user-slice';

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
            <Route path="/logout"><LogOutUser /></Route>
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

test('logout controls follow the current username in the store', () => {
    const { store } = renderWithProviders(<LogOutUser />, { route: '/logout' });
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();

    act(() => { store.dispatch(login('Reader')); });
    expect(screen.getByText('User Reader is currently logged in.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();

    act(() => { store.dispatch(logout()); });
    expect(screen.queryByText('User Reader is currently logged in.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
});
