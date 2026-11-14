import { fireEvent, screen, waitFor } from '@testing-library/react';
import AuthForm from './AuthForm';
import signUpService from '../../services/signUp';
import loginService from '../../services/login';
import bookService from '../../services/books';
import { renderWithProviders } from '../../test-utils';

vi.mock('../../services/signUp');
vi.mock('../../services/login');
vi.mock('../../services/books', () => ({
    __esModule: true,
    default: { setToken: vi.fn() },
}));

beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
});

test('valid signup submits credentials and updates the authenticated state', async () => {
    vi.mocked(signUpService).mockResolvedValue({
        username: 'validuser',
        email: 'valid@email.com',
        token: 'test-token',
    });

    const { store } = renderWithProviders(<AuthForm mode="signup" />, { route: '/signup' });
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
    expect(window.localStorage.getItem('loggedBookappUser')).toBe(JSON.stringify({
        username: 'validuser', email: 'valid@email.com', token: 'test-token',
    }));
});

test('invalid signup does not call the service and records a validation error', () => {
    const { store } = renderWithProviders(<AuthForm mode="signup" />, { route: '/signup' });
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: 'ab' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(signUpService).not.toHaveBeenCalled();
    expect(store.getState().ui.notification).toEqual({
        status: 'error',
        message: 'Username must be at least 3 characters long.',
    });
});

test('login submits to the login service without signup validation', async () => {
    vi.mocked(loginService).mockResolvedValue({
        username: 'ab', email: 'reader@example.com', token: 'login-token',
    });
    const { store } = renderWithProviders(<AuthForm mode="login" />, { route: '/login' });

    expect(screen.queryByLabelText('email:')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: 'ab' } });
    fireEvent.change(screen.getByLabelText('password:'), { target: { value: 'simple' } });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => expect(store.getState().user.user).toBe('ab'));
    expect(loginService).toHaveBeenCalledWith({ username: 'ab', password: 'simple', email: '' });
    expect(signUpService).not.toHaveBeenCalled();
    expect(bookService.setToken).toHaveBeenCalledWith('login-token');
});

test.each([
    { email: '', password: 'ValidPassword1!', message: 'Email must be at least 3 characters long.' },
    {
        email: 'valid@email.com', password: 'weak',
        message: 'Password must be 8 letters long and have AT LEAST: 1 lowercase, 1 uppercase, 1 number and 1 symbol.',
    },
])('signup validates email and password: $message', ({ email, password, message }) => {
    const { store } = renderWithProviders(<AuthForm mode="signup" />);
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: 'validuser' } });
    fireEvent.change(screen.getByLabelText('email:'), { target: { value: email } });
    fireEvent.change(screen.getByLabelText('password:'), { target: { value: password } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(signUpService).not.toHaveBeenCalled();
    expect(loginService).not.toHaveBeenCalled();
    expect(store.getState().ui.notification).toEqual({ status: 'error', message });
});
