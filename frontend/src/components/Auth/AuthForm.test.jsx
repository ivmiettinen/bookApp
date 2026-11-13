import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import AuthForm from './AuthForm';
import signUpService from '../../services/signUp';
import bookService from '../../services/books';
import { renderWithProviders } from '../../test-utils';

vi.mock('../../services/signUp');
vi.mock('../../services/books', () => ({
    __esModule: true,
    default: { setToken: vi.fn() },
}));

beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
});

test('valid signup submits credentials and updates the authenticated state', async () => {
    signUpService.mockResolvedValue({
        username: 'validuser',
        email: 'valid@email.com',
        token: 'test-token',
    });

    const { store } = renderWithProviders(<AuthForm showSignUp />, { route: '/signup' });
    fireEvent.change(screen.getByLabelText('email:'), { target: { value: 'valid@email.com' } });
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: 'validuser' } });
    fireEvent.change(screen.getByLabelText('password:'), { target: { value: 'ValidPassword1!' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => expect(store.getState().user.isAuthenticated).toBe(true));
    expect(signUpService).toHaveBeenCalledWith({
        email: 'valid@email.com',
        username: 'validuser',
        password: 'ValidPassword1!',
    });
    expect(store.getState().user.user).toBe('validuser');
    expect(bookService.setToken).toHaveBeenCalledWith('test-token');
    expect(JSON.parse(window.localStorage.getItem('loggedBookappUser')).username).toBe('validuser');
});

test('invalid signup does not call the service and records a validation error', () => {
    const { store } = renderWithProviders(<AuthForm showSignUp />, { route: '/signup' });
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(signUpService).not.toHaveBeenCalled();
    expect(store.getState().ui.notification).toEqual({
        status: 'error',
        message: 'Username must be at least 3 characters long.',
    });
});
