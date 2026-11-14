import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import AuthForm from '../components/Auth/AuthForm';
import BookForm from '../components/Books/BookForm';
import BookView from '../components/Books/Book';
import signUp from '../services/signUp';
import login from '../services/login';
import books from '../services/books';
import { bookLengthError, formLimits, signUpError, utf8Length } from './formLimits';

vi.mock('../services/signUp');
vi.mock('../services/login');
vi.mock('../services/books', () => ({ default: { create: vi.fn(), setToken: vi.fn() } }));

const email = `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(61)}`;
const credentials = { username: 'ä'.repeat(50), email, password: `Aa1!${'😀'.repeat(17)}` };
const urlPrefix = 'https://example.com/?q=';
const book = { title: '😀'.repeat(150), author: 'ä'.repeat(255), url: `${urlPrefix}${'a'.repeat(formLimits.url - urlPrefix.length)}` };

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});
afterEach(() => vi.restoreAllMocks());

function submit(name: string) {
    const form = screen.getByRole('button', { name }).closest('form');
    if (!form) throw new Error('Form missing');
    fireEvent.submit(form);
}

function fillAuth(input = credentials) {
    for (const [field, value] of Object.entries(input)) {
        fireEvent.change(screen.getByLabelText(`${field}:`), { target: { value } });
    }
}

test('signup sends complete boundary values including a 72-byte Unicode password', async () => {
    expect(email.length).toBe(254);
    expect(utf8Length(credentials.password)).toBe(72);
    vi.mocked(signUp).mockResolvedValue({ ...credentials, token: 'token' });
    const { store } = renderWithProviders(<AuthForm mode="signup" />);
    fillAuth();
    expect(screen.getByLabelText('username:')).toHaveAttribute('maxlength', '50');
    expect(screen.getByLabelText('email:')).toHaveAttribute('maxlength', '254');
    expect(screen.getByLabelText('password:')).not.toHaveAttribute('maxlength');
    submit('Sign up');
    await waitFor(() => expect(store.getState().user.isAuthenticated).toBe(true));
    expect(signUp).toHaveBeenCalledWith(credentials);
});

test.each([
    { field: 'username', value: 'a'.repeat(51), message: 'at most 50' },
    { field: 'username', value: '   ', message: 'at least 3' },
    { field: 'email', value: `a${email}`, message: 'Email address is too long' },
    { field: 'email', value: 'not-an-email', message: 'valid email' },
    { field: 'email', value: 'ä@example.com', message: 'ASCII local part' },
    { field: 'password', value: `${credentials.password}a`, message: 'Password is too long' },
    { field: 'password', value: `Aa1!${'a'.repeat(69)}`, message: 'Password is too long' },
])('signup rejects $field and preserves the input for correction', ({ field, value, message }) => {
    const { store } = renderWithProviders(<AuthForm mode="signup" />);
    fillAuth({ ...credentials, [field]: value });
    submit('Sign up');
    expect(signUp).not.toHaveBeenCalled();
    expect(store.getState().ui.notification?.message).toContain(message);
    expect(screen.getByLabelText(`${field}:`)).toHaveValue(value);
    fireEvent.change(screen.getByLabelText(`${field}:`), { target: { value: credentials[field as keyof typeof credentials] } });
});

test('signup trims username/email and preserves password whitespace', async () => {
    const password = ' ValidPassword1! ';
    vi.mocked(signUp).mockResolvedValue({ username: 'reader', email: 'reader@example.com', token: 'token' });
    renderWithProviders(<AuthForm mode="signup" />);
    fillAuth({ username: ' reader ', email: ' reader@example.com ', password });
    submit('Sign up');
    await waitFor(() => expect(signUp).toHaveBeenCalledWith({ username: 'reader', email: 'reader@example.com', password }));
});

test('login preserves legacy credentials beyond signup limits', async () => {
    const username = ` ${'a'.repeat(51)} `;
    const password = 'a'.repeat(73);
    vi.mocked(login).mockResolvedValue({ username, email, token: 'token' });
    renderWithProviders(<AuthForm mode="login" />);
    fireEvent.change(screen.getByLabelText('username:'), { target: { value: username } });
    fireEvent.change(screen.getByLabelText('password:'), { target: { value: password } });
    submit('Login');
    await waitFor(() => expect(login).toHaveBeenCalledWith({ username, password, email: '' }));
});

test('creates and displays complete boundary book fields', async () => {
    expect(book.url.length).toBe(formLimits.url);
    vi.mocked(books.create).mockResolvedValue({ ...book, id: 'one' });
    renderWithProviders(<><BookForm /><BookView /></>);
    fireEvent.click(screen.getByRole('button', { name: 'Add a book' }));
    for (const [field, value] of Object.entries(book)) {
        fireEvent.change(screen.getByRole('textbox', { name: `${field}:` }), { target: { value } });
    }
    submit('create');
    expect(await screen.findByText(book.title)).toBeVisible();
    expect(screen.getByText(`by ${book.author}`, { exact: false })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'view' }));
    expect(screen.getByRole('link', { name: book.url })).toHaveAttribute('href', book.url);
    expect(books.create).toHaveBeenCalledWith(book);
});

test.each([
    { field: 'title', value: 'a'.repeat(301), message: 'at most 300' },
    { field: 'author', value: 'ä'.repeat(256), message: 'at most 255' },
    { field: 'url', value: `${book.url}a`, message: 'at most 500' },
    { field: 'title', value: '   ', message: 'must not be empty' },
    { field: 'author', value: '   ', message: 'must not be empty' },
    { field: 'url', value: '   ', message: 'must not be empty' },
])('book rejects $field on direct submit and allows a corrected retry', async ({ field, value, message }) => {
    vi.mocked(books.create).mockResolvedValue({ ...book, id: 'one' });
    renderWithProviders(<BookForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Add a book' }));
    for (const [name, initial] of Object.entries({ ...book, [field]: value })) {
        fireEvent.change(screen.getByRole('textbox', { name: `${name}:` }), { target: { value: initial } });
    }
    submit('create');
    expect(books.create).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('textbox', { name: `${field}:` })).toHaveValue(value.trim() === '' && field === 'url' ? '' : value);
    fireEvent.change(screen.getByRole('textbox', { name: `${field}:` }), { target: { value: book[field as keyof typeof book] } });
    submit('create');
    expect(await screen.findByRole('button', { name: 'Add a book' })).toBeVisible();
});

test('book trims surrounding whitespace and preserves internal spaces', async () => {
    vi.mocked(books.create).mockResolvedValue({ ...book, id: 'one' });
    renderWithProviders(<BookForm />);
    fireEvent.click(screen.getByRole('button', { name: 'Add a book' }));
    for (const [field, value] of Object.entries({ title: ' A  book ', author: ' An Author ', url: ' https://example.com ' })) {
        fireEvent.change(screen.getByRole('textbox', { name: `${field}:` }), { target: { value } });
    }
    submit('create');
    await waitFor(() => expect(books.create).toHaveBeenCalledWith({ title: 'A  book', author: 'An Author', url: 'https://example.com' }));
});

test('UTF-8 counts ASCII, BMP, astral and unpaired surrogate input without throwing', () => {
    expect(utf8Length('aä😀\ud800')).toBe(10);
    expect(signUpError({ ...credentials, password: `Aa1!${'a'.repeat(68)}` })).toBeNull();
    expect(bookLengthError(book)).toBeNull();
});
