import axios, { AxiosError, AxiosHeaders } from 'axios';
import books from './books';
import login from './login';
import signUp from './signUp';
import { getApiUrl } from './apiConfig';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

// Keep AxiosError/isAxiosError real while preventing every outgoing HTTP call.
vi.mock('axios', async (importOriginal) => {
    const actual = await importOriginal<typeof import('axios')>();
    return {
        ...actual,
        default: {
            ...actual.default,
            get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
        },
    };
});

const book = { id: 'book-id', title: 'Title', author: 'Author', url: 'https://example.test/book' };
const credentials = { username: 'reader', password: 'test-password' };
const signupInput = { ...credentials, email: 'reader@example.test' };
const session = { token: 'test-token', username: credentials.username, email: signupInput.email };
const authCases = [
    { name: 'login', call: () => login(credentials), input: credentials, url: '/api/login', key: 'VITE_LOGIN_URL_DEV', legacy: 'REACT_APP_loginUrl_dev' },
    { name: 'signup', call: () => signUp(signupInput), input: signupInput, url: '/api/users', key: 'VITE_USER_URL_DEV', legacy: 'REACT_APP_userUrl_dev' },
] as const;

beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('DEV', true);
    vi.stubEnv('VITE_BOOKS_URL_DEV', '/api/books');
    vi.stubEnv('VITE_LOGIN_URL_DEV', '/api/login');
    vi.stubEnv('VITE_USER_URL_DEV', '/api/users');
    books.setToken(null);
});

afterEach(() => vi.unstubAllEnvs());

describe('API configuration', () => {
    const cases = [
        ['books', 'VITE_BOOKS_URL', 'REACT_APP_books_Url', 'VITE_BOOKS_URL_DEV', 'REACT_APP_books_Url_dev'],
        ['login', 'VITE_LOGIN_URL', 'REACT_APP_loginUrl', 'VITE_LOGIN_URL_DEV', 'REACT_APP_loginUrl_dev'],
        ['signUp', 'VITE_USER_URL', 'REACT_APP_userUrl', 'VITE_USER_URL_DEV', 'REACT_APP_userUrl_dev'],
    ] as const;

    test.each(cases)('%s chooses the current environment and prioritizes VITE over legacy', (service, primary, legacy, devPrimary, devLegacy) => {
        vi.stubEnv(primary, '/production');
        vi.stubEnv(legacy, '/production-legacy');
        vi.stubEnv(devPrimary, '/development');
        vi.stubEnv(devLegacy, '/development-legacy');
        expect(getApiUrl(service)).toBe('/development');
        vi.stubEnv(devPrimary, '');
        expect(getApiUrl(service)).toBe('/development-legacy');
        vi.stubEnv('DEV', false);
        expect(getApiUrl(service)).toBe('/production');
        vi.stubEnv(primary, '');
        expect(getApiUrl(service)).toBe('/production-legacy');
    });

    test.each(['undefined', 'ftp://example.test', '//example.test', 'https://user:password@example.test', '/api/books?query=x', '/'])('rejects invalid configuration without exposing its value (%#)', async (value) => {
        vi.stubEnv('VITE_BOOKS_URL_DEV', value);
        await expect(books.getAll()).rejects.toMatchObject({ kind: 'configuration', message: 'Invalid API configuration: books' });
        expect(axios.get).not.toHaveBeenCalled();
    });

    test('accepts an absolute HTTP URL and removes trailing slashes', () => {
        vi.stubEnv('VITE_BOOKS_URL_DEV', 'https://example.test/api/books/');
        expect(getApiUrl('books')).toBe('https://example.test/api/books');
    });

    test('missing development configuration never falls back to production', async () => {
        vi.stubEnv('VITE_BOOKS_URL_DEV', '');
        vi.stubEnv('REACT_APP_books_Url_dev', '');
        vi.stubEnv('VITE_BOOKS_URL', '/production');
        await expect(books.getAll()).rejects.toMatchObject({ kind: 'configuration' });
        expect(axios.get).not.toHaveBeenCalled();
    });
});

describe('book services', () => {
    test('accepts a list without user or optional likes and preserves nullable fields and ID references', async () => {
        const data = [book, { ...book, likes: null, user: null, likesbyId: null }, { ...book, likes: 2, user: 'user-id', likesbyId: ['user-id'] }];
        vi.mocked(axios.get).mockResolvedValue({ data });
        await expect(books.getAll()).resolves.toEqual(data);
        expect(axios.get).toHaveBeenCalledWith('/api/books');
        vi.mocked(axios.get).mockResolvedValue({ data: [] });
        await expect(books.getAll()).resolves.toEqual([]);
    });

    test.each([
        null, {}, '<html>Error</html>', [null], [{ ...book, id: 1 }],
        [{ ...book, title: null }], [{ ...book, author: 1 }], [{ ...book, url: undefined }],
        [{ ...book, likes: '2' }], [{ ...book, likes: Infinity }],
        [{ ...book, user: { id: 'user-id', username: 'reader' } }],
        [{ ...book, likesbyId: ['user-id', 1] }], [{ ...book, likesbyId: {} }],
    ].map(data => ({ data })))('rejects malformed lists and unsupported populated references (%#)', async ({ data }) => {
        vi.mocked(axios.get).mockResolvedValue({ data });
        await expect(books.getAll()).rejects.toMatchObject({ kind: 'invalid-response' });
    });

    test('creates and updates a book with authorization and validates returned JSON', async () => {
        books.setToken('test-token');
        const input = { title: book.title, author: book.author, url: book.url };
        const saved = { ...book, likes: 0, user: 'user-id', likesbyId: [] };
        vi.mocked(axios.post).mockResolvedValue({ data: saved });
        await expect(books.create(input)).resolves.toEqual(saved);
        expect(axios.post).toHaveBeenCalledWith('/api/books', input, { headers: { Authorization: 'bearer test-token' } });
        vi.mocked(axios.put).mockResolvedValue({ data: { ...saved, likes: 1 } });
        await expect(books.update(book.id, { likes: 1 })).resolves.toMatchObject({ likes: 1 });
        expect(axios.put).toHaveBeenCalledWith(`/api/books/${book.id}`, { likes: 1 }, { headers: { Authorization: 'bearer test-token' } });
        vi.mocked(axios.post).mockResolvedValue({ data: { title: 'Incomplete' } });
        await expect(books.create(input)).rejects.toMatchObject({ kind: 'invalid-response' });
        vi.mocked(axios.put).mockResolvedValue({ data: null });
        await expect(books.update(book.id, { likes: 1 })).rejects.toMatchObject({ kind: 'invalid-response' });
    });

    test('deletes with a 204 response, encodes the id and clears authorization', async () => {
        books.setToken('test-token');
        books.setToken(null);
        vi.mocked(axios.delete).mockResolvedValue({ status: 204, data: '' });
        await expect(books.remove('id/part')).resolves.toBeUndefined();
        expect(axios.delete).toHaveBeenCalledWith('/api/books/id%2Fpart', { headers: {} });
        vi.mocked(axios.delete).mockResolvedValue({ status: 200, data: '<html>Fallback</html>' });
        await expect(books.remove(book.id)).rejects.toMatchObject({ kind: 'invalid-response' });
    });
});

describe.each(authCases)('$name service', ({ call, input, url, key, legacy }) => {
    test('returns only the validated session fields', async () => {
        vi.mocked(axios.post).mockResolvedValue({ data: { ...session, passwordHash: 'must-not-be-stored' } });
        await expect(call()).resolves.toEqual(session);
        expect(axios.post).toHaveBeenCalledWith(url, input);
    });

    test.each([null, '<html>Error</html>', { ...session, token: '' }, { ...session, email: undefined }, { ...session, username: 1 }])('rejects malformed sessions (%#)', async (data) => {
        vi.mocked(axios.post).mockResolvedValue({ data });
        await expect(call()).rejects.toMatchObject({ kind: 'invalid-response' });
    });

    test('rejects missing configuration before making a request', async () => {
        vi.stubEnv(key, '');
        vi.stubEnv(legacy, '');
        await expect(call()).rejects.toMatchObject({ kind: 'configuration' });
        expect(axios.post).not.toHaveBeenCalled();
    });

    test('classifies network failures', async () => {
        vi.mocked(axios.post).mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK', undefined, {}));
        await expect(call()).rejects.toMatchObject({ kind: 'network', response: undefined });
    });
});

describe('request failures', () => {
    test.each([{ error: 'invalid username or password' }, '<html>Server error</html>'])('keeps HTTP status and untrusted data for existing consumers (%#)', async (data) => {
        const response = { status: 401, data, statusText: 'Unauthorized', headers: new AxiosHeaders(), config: { headers: new AxiosHeaders() } };
        vi.mocked(axios.post).mockRejectedValue(new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, {}, response));
        await expect(login(credentials)).rejects.toMatchObject({ kind: 'http', response: { status: 401, data } });
    });

    test('classifies a network failure without an HTTP response', async () => {
        vi.mocked(axios.get).mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK', undefined, {}));
        await expect(books.getAll()).rejects.toMatchObject({ kind: 'network', response: undefined });
    });

    test.each([new Error('Unexpected internal details'), 'failure', null, new AxiosError('Setup error')])('classifies unknown errors without exposing internal details (%#)', async (error: unknown) => {
        vi.mocked(axios.get).mockRejectedValue(error);
        await expect(books.getAll()).rejects.toMatchObject({ kind: 'unexpected', message: 'Unexpected API request failure' });
    });
});
