import { StrictMode, useState } from 'react';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, expect, test, vi } from 'vitest';
import App from './App';
import { renderWithProviders } from './test-utils';
import bookService from './services/books';
import type { Book } from './types/api';
import { initializeBooks } from './store/book-slice';
import { useHistory } from 'react-router-dom';

vi.mock('./services/books', () => ({ default: { getAll: vi.fn() } }));

const book: Book = {
    id: 'book-1', title: 'A loaded book', author: 'Reader', url: 'https://example.com', likes: 0,
};

const deferredBooks = () => {
    let resolve: (books: Book[]) => void = () => { throw new Error('Promise not initialized'); };
    let reject: (error: unknown) => void = () => { throw new Error('Promise not initialized'); };
    const promise = new Promise<Book[]>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
};

beforeEach(() => vi.resetAllMocks());

test.each([
    { route: '/login', button: 'Login', signup: false },
    { route: '/signup', button: 'Sign up', signup: true },
])('$route opens the right form directly and after a fresh mount', async ({ route, button, signup }) => {
    vi.mocked(bookService.getAll).mockResolvedValue([]);
    const assertForm = () => {
        expect(screen.getByRole('button', { name: button })).toBeInTheDocument();
        expect(screen.getByLabelText('username:')).toBeInTheDocument();
        expect(screen.getByLabelText('password:')).toBeInTheDocument();
        expect(screen.queryByLabelText('email:') !== null).toBe(signup);
    };
    const first = renderWithProviders(<App />, { route });
    assertForm();
    await waitFor(() => expect(first.store.getState().books.status).toBe('succeeded'));
    first.unmount();

    const second = renderWithProviders(<App />, { route });
    assertForm();
    await waitFor(() => expect(second.store.getState().books.status).toBe('succeeded'));
});

test('auth navigation and history select the form from the current route', async () => {
    vi.mocked(bookService.getAll).mockResolvedValue([]);
    const HistoryControls = () => {
        const history = useHistory();
        return <button onClick={() => history.goBack()}>Back</button>;
    };
    const { store } = renderWithProviders(<><HistoryControls /><App /></>, { route: '/auth' });
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByLabelText('email:')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('link', { name: 'Auth' }));
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.queryByLabelText('email:')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.queryByLabelText('username:')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('email:')).toBeInTheDocument();
    await waitFor(() => expect(store.getState().books.status).toBe('succeeded'));
});

test('a delayed request keeps loading visible until the books arrive', async () => {
    const request = deferredBooks();
    vi.mocked(bookService.getAll).mockReturnValue(request.promise);
    const { store } = renderWithProviders(<App />, { route: '/books' });

    expect(screen.getByRole('status').textContent).toContain('Fetching data');
    expect(screen.queryByText('No books yet.')).toBeNull();
    expect(store.getState().books.status).toBe('loading');
    await act(async () => request.resolve([book]));

    expect(screen.getByText(book.title)).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(store.getState().books.status).toBe('succeeded');
});

test('a failed request stops loading and retry recovers through loading to success', async () => {
    const firstRequest = deferredBooks();
    const retry = deferredBooks();
    vi.mocked(bookService.getAll)
        .mockReturnValueOnce(firstRequest.promise)
        .mockReturnValueOnce(retry.promise);
    const { store } = renderWithProviders(<App />, { route: '/books' });

    await act(async () => firstRequest.reject(new Error('Network unavailable')));
    expect((await screen.findByRole('alert')).textContent).toContain('Could not load books');
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByText('No books yet.')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('status').textContent).toContain('Fetching data');
    expect(screen.queryByRole('alert')).toBeNull();
    expect(store.getState().books.error).toBeNull();
    await act(async () => retry.resolve([book]));

    expect(screen.getByText(book.title)).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
    expect(bookService.getAll).toHaveBeenCalledTimes(2);
});

test('a successful empty response shows an empty list message', async () => {
    vi.mocked(bookService.getAll).mockResolvedValue([]);
    renderWithProviders(<App />, { route: '/books' });

    expect(await screen.findByText('No books yet.')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
});

test('reloading replaces the entire list without duplicating books and can clear it', async () => {
    vi.mocked(bookService.getAll).mockResolvedValue([book]);
    const { store } = renderWithProviders(<App />, { route: '/books' });
    await screen.findByText(book.title);

    await act(async () => { await store.dispatch(initializeBooks()); });
    expect(screen.getAllByText(book.title)).toHaveLength(1);
    expect(store.getState().books.items).toEqual([book]);

    vi.mocked(bookService.getAll).mockResolvedValue([]);
    await act(async () => { await store.dispatch(initializeBooks()); });
    expect(screen.getByText('No books yet.')).toBeTruthy();
    expect(screen.queryByText(book.title)).toBeNull();
});

test('StrictMode and remounting share an in-flight request and remounting after success does not duplicate books', async () => {
    const request = deferredBooks();
    vi.mocked(bookService.getAll).mockReturnValueOnce(request.promise).mockResolvedValue([book]);
    const RemountApp = () => {
        const [key, setKey] = useState(0);
        return <>
            <button onClick={() => setKey((value) => value + 1)}>Remount</button>
            <App key={key} />
        </>;
    };
    renderWithProviders(<StrictMode><RemountApp /></StrictMode>, { route: '/books' });
    fireEvent.click(screen.getByRole('button', { name: 'Remount' }));
    expect(bookService.getAll).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('status')).toBeTruthy();
    await act(async () => request.resolve([book]));
    expect(screen.getAllByText(book.title)).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Remount' }));
    await waitFor(() => expect(screen.getAllByText(book.title)).toHaveLength(1));
    expect(bookService.getAll).toHaveBeenCalledTimes(2);
});
