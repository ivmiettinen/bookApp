import axios from 'axios';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import App from '../App';
import { setupStore } from '../store';
import { createBook, initializeBooks } from '../store/book-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import useBookActions from '../store/useBookActions';
import MainHeader from '../components/LayOut/MainHeader';
import LogOutUser from '../components/Auth/LogOutUser';
import LikeButton from '../components/Books/LikeButton';
import Notification from '../components/UI/Notification';
import { ApiError } from './apiError';
import books from './books';
import { restoreSession } from './session';

vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal<typeof import('axios')>();
    return { ...actual, default: { ...actual.default, get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } };
});

const key = 'loggedBookappUser';
const session = { token: 'session-token', username: 'ServerReader', email: 'reader@example.test' };
const book = { id: 'book-1', title: 'Test book', author: 'Writer', url: 'https://example.test', likes: 0 };

function start(route = '/books', content = <App />) {
    const store = setupStore();
    store.dispatch(restoreSession());
    const view = render(<Provider store={store}><MemoryRouter initialEntries={[route]}>{content}</MemoryRouter></Provider>);
    return { ...view, store };
}

beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
    books.setToken(null);
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_BOOKS_URL_DEV', '/api/books');
    vi.stubEnv('VITE_LOGIN_URL_DEV', '/api/login');
    vi.stubEnv('VITE_USER_URL_DEV', '/api/users');
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    vi.mocked(axios.delete).mockResolvedValue({ status: 204 });
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
});

test.each(['login', 'signup'])('%s stores only the server session and restores user, UI and token on a fresh start', async (mode) => {
    vi.mocked(axios.post).mockResolvedValue({ data: { ...session, password: 'must-not-be-stored' } });
    const first = start(`/${mode}`);
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: 'FormReader' } });
    fireEvent.change(screen.getByLabelText('password:'), { target: { value: 'ValidPassword1!' } });
    if (mode === 'signup') fireEvent.change(screen.getByLabelText('email:'), { target: { value: session.email } });
    fireEvent.click(screen.getByRole('button', { name: mode === 'signup' ? 'Sign up' : 'Login' }));
    await screen.findByText('No books yet.');
    expect(first.store.getState().user).toEqual({ user: session.username, isAuthenticated: true });
    const storedSession = window.localStorage.getItem(key);
    if (storedSession === null) throw new Error('Expected authentication to save a session');
    const savedSession: unknown = JSON.parse(storedSession);
    expect(savedSession).toEqual(session);
    expect(screen.getByRole('link', { name: 'Logout' })).toBeInTheDocument();
    first.unmount();

    const second = start('/logout');
    expect(screen.getByText(`User ${session.username} is currently logged in.`)).toBeInTheDocument();
    expect(second.store.getState().user.isAuthenticated).toBe(true);
    await act(async () => { await books.remove(book.id); });
    expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', { headers: { Authorization: 'bearer session-token' } });
    await waitFor(() => expect(second.store.getState().books.status).toBe('succeeded'));
});

test.each(['{broken', 'null', '[]', '"reader"', '{}', '{"username":"old user"}', '{"token":"old-token"}', JSON.stringify({ ...session, token: null }), JSON.stringify({ ...session, email: 123 })])(
    'invalid or obsolete storage does not block startup (%#)', async (stored) => {
        window.localStorage.setItem(key, stored);
        window.localStorage.setItem('other-app', 'keep');
        const { store } = start();
        await screen.findByText('No books yet.');
        expect(store.getState().user).toEqual({ user: null, isAuthenticated: false });
        expect(screen.getByRole('link', { name: 'Auth' })).toBeInTheDocument();
        expect(window.localStorage.getItem(key)).toBeNull();
        expect(window.localStorage.getItem('other-app')).toBe('keep');
        await act(async () => { await books.remove(book.id); });
        expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', { headers: {} });
    },
);

test('missing storage clears a token from a previous app instance', async () => {
    books.setToken('previous-token');
    const { store } = start();
    await screen.findByText('No books yet.');
    expect(store.getState().user.isAuthenticated).toBe(false);
    await act(async () => { await books.remove(book.id); });
    expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', { headers: {} });
});

test('logout clears user, token and only the app storage key with one truthful notification', async () => {
    window.localStorage.setItem(key, JSON.stringify(session));
    window.localStorage.setItem('other-app', 'keep');
    const { store } = start('/logout');
    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Successfully logged out');
    expect(screen.queryByText('Successful log in')).not.toBeInTheDocument();
    expect(store.getState().user).toEqual({ user: null, isAuthenticated: false });
    expect(window.localStorage.getItem(key)).toBeNull();
    expect(window.localStorage.getItem('other-app')).toBe('keep');
    await act(async () => { await books.remove(book.id); });
    expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', { headers: {} });
    await waitFor(() => expect(store.getState().books.status).toBe('succeeded'));
});

test.each(['getItem', 'removeItem'] as const)('storage %s failure leaves startup/logout usable and clears the active token', async (method) => {
    window.localStorage.setItem(key, JSON.stringify(session));
    vi.spyOn(Storage.prototype, method).mockImplementation(() => { throw new Error('Storage blocked'); });
    const { store } = start('/logout');
    if (method === 'removeItem') fireEvent.click(screen.getByRole('button', { name: 'Log out' }));
    expect(store.getState().user.isAuthenticated).toBe(false);
    expect(screen.getByRole('alert')).toHaveTextContent(method === 'getItem' ? 'Could not restore' : 'Could not remove');
    await act(async () => { await books.remove(book.id); });
    expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', { headers: {} });
    await waitFor(() => expect(store.getState().books.status).toBe('succeeded'));
});

test('failed session persistence does not activate login or navigate to books', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: session });
    const { store } = start('/login');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save your session');
    expect(store.getState().user.isAuthenticated).toBe(false);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    await act(async () => { await books.remove(book.id); });
    expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', { headers: {} });
});

test.each([
    { status: 401, data: { error: 'invalid username or password' }, message: 'Invalid username or password' },
    { status: 400, data: { error: 'User validation failed: username: expected `username` to be unique.' }, message: "Username '' is already in use" },
    { status: 500, data: '<html>Failure</html>', message: 'Could not authenticate' },
    { status: 400, data: { unrelated: 'unique invalid username or password' }, message: 'Could not authenticate' },
])('auth handles HTTP $status with a useful fallback (%#)', async ({ status, data, message }) => {
    vi.mocked(axios.post).mockRejectedValue(new ApiError('http', 'Request failed', { status, data }));
    const { store } = start('/login');
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(store.getState().user.isAuthenticated).toBe(false);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
});

test.each(['network', 'http'] as const)('auth %s failure treats an existing session consistently', async (kind) => {
    window.localStorage.setItem(key, JSON.stringify(session));
    const error = new ApiError(kind, 'Request failed', kind === 'http'
        ? { status: 401, data: { error: 'invalid username or password' } } : undefined);
    vi.mocked(axios.post).mockRejectedValue(error);
    const { store } = start('/login');
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(kind === 'http'
        ? 'Invalid username or password' : 'Could not authenticate');
    expect(store.getState().user.isAuthenticated).toBe(kind === 'network');
    expect(window.localStorage.getItem(key) !== null).toBe(kind === 'network');
    expect(screen.queryByRole('link', { name: 'Logout' }) !== null).toBe(kind === 'network');
    await act(async () => { await books.remove(book.id); });
    expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', {
        headers: kind === 'network' ? { Authorization: 'bearer session-token' } : {},
    });
});

function BookOperations() {
    const { addBook, deleteBook } = useBookActions();
    const dispatch = useAppDispatch();
    const error = useAppSelector((state) => state.books.error);
    return <>
        <MainHeader /><LogOutUser /><Notification />
        {error && <p role="alert">{error}</p>}
        <button onClick={() => addBook(book)}>Add test book</button>
        <button onClick={() => deleteBook(book.id)}>Delete test book</button>
        <button onClick={() => dispatch(initializeBooks())}>Load test books</button>
        <div role="group" aria-label="Like control"><LikeButton booksId={book.id} /></div>
    </>;
}

test.each(['Add test book', 'Delete test book', 'Load test books', 'Like control'])('%s distinguishes 401 from network failure in user, token and UI', async (operation) => {
    for (const kind of ['network', 'http'] as const) {
        window.localStorage.setItem(key, JSON.stringify(session));
        window.localStorage.setItem('other-app', 'keep');
        const error = new ApiError(kind, 'Request failed', kind === 'http' ? { status: 401, data: '<html>Unauthorized</html>' } : undefined);
        vi.mocked(axios.post).mockRejectedValue(error);
        vi.mocked(axios.delete).mockRejectedValue(error);
        vi.mocked(axios.get).mockRejectedValue(error);
        vi.mocked(axios.put).mockRejectedValue(error);
        const view = start('/logout', <BookOperations />);
        act(() => { view.store.dispatch(createBook(book)); });
        const button = operation === 'Like control'
            ? within(screen.getByRole('group', { name: operation })).getByRole('button')
            : screen.getByRole('button', { name: operation });
        fireEvent.click(button);
        const expectedMessage = operation === 'Load test books'
            ? kind === 'http' ? 'session was rejected' : 'Could not load books'
            : kind === 'http' ? 'You must log in' : 'No response was received';
        await waitFor(() => expect(screen.getAllByRole('alert').some((alert) =>
            alert.textContent?.includes(expectedMessage),
        )).toBe(true));
        expect(view.store.getState().user.isAuthenticated).toBe(kind === 'network');
        expect(screen.queryByRole('link', { name: 'Logout' }) !== null).toBe(kind === 'network');
        expect(window.localStorage.getItem(key) !== null).toBe(kind === 'network');
        expect(window.localStorage.getItem('other-app')).toBe('keep');
        vi.mocked(axios.delete).mockResolvedValue({ status: 204 });
        await act(async () => { await books.remove(book.id); });
        expect(axios.delete).toHaveBeenLastCalledWith('/api/books/book-1', {
            headers: kind === 'network' ? { Authorization: 'bearer session-token' } : {},
        });
        view.unmount();
    }
});

test.each([
    { operation: 'Delete test book', status: 400, data: { error: 'invalid user' }, message: 'You can only remove books you have added yourself.' },
    { operation: 'Delete test book', status: 500, data: '<html>Error</html>', message: 'The deletion could not be confirmed.' },
    { operation: 'Like control', status: 500, data: '<html>Error</html>', message: 'The like update could not be confirmed.' },
])('$operation explains a known permission error or an unconfirmed result ($status)', async ({ operation, status, data, message }) => {
    window.localStorage.setItem(key, JSON.stringify(session));
    const error = new ApiError('http', 'Request failed', { status, data });
    vi.mocked(axios.delete).mockRejectedValue(error);
    vi.mocked(axios.put).mockRejectedValue(error);
    const { store } = start('/logout', <BookOperations />);
    act(() => { store.dispatch(createBook(book)); });
    const button = operation === 'Like control'
        ? within(screen.getByRole('group', { name: operation })).getByRole('button')
        : screen.getByRole('button', { name: operation });
    fireEvent.click(button);
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(store.getState().user.isAuthenticated).toBe(true);
    expect(store.getState().books.items).toEqual([book]);
    expect(window.localStorage.getItem(key)).toBe(JSON.stringify(session));
});
