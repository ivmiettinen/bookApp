import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import BookView from './Book';
import BookForm from './BookForm';
import BookOptions from './BookOptions';
import LikeButton from './LikeButton';
import { renderWithProviders } from '../../test-utils';
import bookService from '../../services/books';
import type { Book } from '../../types/api';
import { useAppSelector } from '../../store/hooks';
import useBookActions from '../../store/useBookActions';
import { addLike, initializeBooks, likeBook, removeBook } from '../../store/book-slice';
import { ApiError } from '../../services/apiError';

vi.mock('../../services/books', () => ({
    default: { getAll: vi.fn(), create: vi.fn(), remove: vi.fn(), update: vi.fn(), setToken: vi.fn() },
}));

const book: Book = { id: 'one', title: 'Zulu', author: 'Alpha', url: 'https://example.com', likes: 1 };
const otherBook: Book = { ...book, id: 'two', title: 'Alpha', author: 'Zulu', likes: 4 };
const booksState = (items: Book[]) => ({ books: { items, status: 'succeeded' as const, error: null, pendingLikeIds: [] } });

const Notification = () => {
    const notification = useAppSelector((state) => state.ui.notification);
    return notification && <p role="status">{notification.message}</p>;
};

const fillForm = async (url = book.url) => {
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Add a book' }));
    await user.type(screen.getByRole('textbox', { name: 'title:' }), book.title);
    await user.type(screen.getByRole('textbox', { name: 'author:' }), book.author);
    await user.type(screen.getByRole('textbox', { name: 'url:' }), url);
    return user;
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
});
afterEach(() => vi.restoreAllMocks());

test('keyboard submission waits, blocks repeats, then closes and resets the form', async () => {
    let finish: (value: Book) => void = () => { throw new Error('Request not started'); };
    vi.mocked(bookService.create).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const { store } = renderWithProviders(<><BookForm /><Notification /></>);
    const user = await fillForm();
    await user.keyboard('{Enter}');
    const title = screen.getByRole('textbox', { name: 'title:' });
    expect(title).toBeVisible();
    expect(title).toHaveValue(book.title);
    expect(title).toBeDisabled();
    expect(screen.getByRole('button', { name: 'hide' })).toBeDisabled();
    const submit = screen.getByRole('button', { name: 'create' });
    expect(submit).toBeDisabled();
    const form = submit.closest('form');
    if (!form) throw new Error('Book form missing');
    fireEvent.submit(form);
    expect(bookService.create).toHaveBeenCalledTimes(1);
    expect(store.getState().books.items).toEqual([]);
    await act(async () => finish(book));
    expect(screen.getByRole('status')).toHaveTextContent('A new book Zulu by Alpha added');
    expect(store.getState().books.items).toEqual([book]);
    await user.click(screen.getByRole('button', { name: 'Add a book' }));
    for (const input of screen.getAllByRole('textbox')) {
        expect(input).toHaveValue('');
        expect(input).toBeEnabled();
    }
});

test('a delayed failure preserves all input and allows a successful retry', async () => {
    let fail: (error: Error) => void = () => { throw new Error('Request not started'); };
    vi.mocked(bookService.create).mockImplementationOnce(() => new Promise((_resolve, reject) => { fail = reject; }));
    renderWithProviders(<><BookForm /><Notification /></>);
    const user = await fillForm();
    await user.click(screen.getByRole('button', { name: 'create' }));
    await act(async () => fail(new Error('Unavailable')));
    expect(screen.getByRole('status')).toHaveTextContent('The addition could not be confirmed.');
    expect(screen.getByRole('textbox', { name: 'title:' })).toHaveValue(book.title);
    expect(screen.getByRole('textbox', { name: 'author:' })).toHaveValue(book.author);
    expect(screen.getByRole('textbox', { name: 'url:' })).toHaveValue(book.url);
    expect(screen.queryByRole('button', { name: 'Add a book' })).not.toBeInTheDocument();
    vi.mocked(bookService.create).mockResolvedValue(book);
    await user.click(screen.getByRole('button', { name: 'create' }));
    expect(await screen.findByRole('button', { name: 'Add a book' })).toBeVisible();
    expect(bookService.create).toHaveBeenLastCalledWith({ title: book.title, author: book.author, url: book.url });
});

test.each(['javascript:alert(1)', 'data:text/plain,book', 'ftp://example.com/book'])('rejects %s and allows correcting the URL', async (url) => {
    vi.mocked(bookService.create).mockResolvedValue(book);
    renderWithProviders(<BookForm />);
    const user = await fillForm(url);
    const input = screen.getByRole('textbox', { name: 'url:' });
    expect(input).toBeInvalid();
    await user.click(screen.getByRole('button', { name: 'create' }));
    expect(bookService.create).not.toHaveBeenCalled();
    expect(input).toHaveValue(url);
    await user.clear(input);
    await user.type(input, 'http://example.com/book');
    expect(input).toBeValid();
    await user.click(screen.getByRole('button', { name: 'create' }));
    expect(await screen.findByRole('button', { name: 'Add a book' })).toBeVisible();
});

test.each(['https://example.com', 'http://example.com', 'javascript:alert(1)', 'data:text/plain,book', '/relative', 'broken'])('opens details and safely displays stored URL %s', async (url) => {
    const user = userEvent.setup();
    renderWithProviders(<BookView />, { preloadedState: booksState([{ ...book, url }]) });
    expect(screen.queryByRole('button', { name: 'Like book' })).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: 'view' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(screen.getByText(url)).toBeVisible();
    if (url.startsWith('http')) {
        expect(screen.getByRole('link', { name: url })).toHaveAttribute('href', url);
        expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer');
    } else expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Like book' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'delete' })).toHaveAttribute('type', 'button');
    await user.click(screen.getByRole('button', { name: 'hide' }));
    expect(screen.getByRole('button', { name: 'view' })).toBeVisible();
});

test('sorts the actual book views through the named selector', () => {
    const { container } = renderWithProviders(<><BookOptions /><BookView /></>, {
        preloadedState: booksState([book, otherBook]),
    });
    for (const [key, firstId] of [['title', 'two'], ['author', 'one'], ['likes', 'two']]) {
        fireEvent.change(screen.getByRole('combobox', { name: 'Sort books' }), { target: { value: key } });
        const ids = Array.from(container.querySelectorAll('[id]')).map((item) => item.id);
        expect(ids[0]).toBe(firstId);
    }
});

test('cancels deletion, preserves a book on failure, and removes it on successful retry', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<><BookView /><Notification /></>, { preloadedState: booksState([book]) });
    await user.click(screen.getByRole('button', { name: 'view' }));
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    await user.click(screen.getByRole('button', { name: 'delete' }));
    expect(bookService.remove).not.toHaveBeenCalled();
    vi.mocked(bookService.remove).mockRejectedValueOnce(new Error('Unavailable'));
    await user.click(screen.getByRole('button', { name: 'delete' }));
    expect(screen.getByRole('status')).toHaveTextContent('The deletion could not be confirmed.');
    expect(screen.getByText(book.title)).toBeVisible();
    vi.mocked(bookService.remove).mockResolvedValueOnce(undefined);
    await user.click(screen.getByRole('button', { name: 'delete' }));
    await waitFor(() => expect(screen.queryByText(book.title)).not.toBeInTheDocument());
    expect(store.getState().books.items).toEqual([]);
    expect(screen.getByRole('status')).toHaveTextContent('successfully deleted');
});

const MissingBookControls = () => {
    const { deleteBook } = useBookActions();
    return <><button onClick={() => deleteBook('missing')}>Delete missing book</button>
        <LikeButton booksId="missing" /></>;
};

test('missing books are safe for delete and like controls', async () => {
    const user = userEvent.setup();
    const { store } = renderWithProviders(<MissingBookControls />);
    await user.click(screen.getByRole('button', { name: 'Delete missing book' }));
    await user.click(screen.getByRole('button', { name: 'Like book' }));
    expect(window.confirm).not.toHaveBeenCalled();
    expect(bookService.remove).not.toHaveBeenCalled();
    expect(bookService.update).not.toHaveBeenCalled();
    expect(store.getState().ui.notification).toBeNull();
    await store.dispatch(likeBook('missing'));
    expect(bookService.update).not.toHaveBeenCalled();
});

test('likes follow Redux, the server response and a fresh list load without an unlike toggle', async () => {
    const saved = { ...book, likes: 17 };
    vi.mocked(bookService.update).mockResolvedValueOnce(saved).mockResolvedValueOnce({ ...book, likes: 3 });
    vi.mocked(bookService.getAll).mockResolvedValue([{ ...book, likes: 3 }]);
    const view = renderWithProviders(<LikeButton booksId={book.id} />, { preloadedState: booksState([book]) });
    act(() => { view.store.dispatch(addLike({ ...book, likes: 6 })); });
    expect(screen.getByText('likes: 6')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Like book' }));
    expect(await screen.findByText('likes: 17')).toBeVisible();
    expect(bookService.update).toHaveBeenLastCalledWith(book.id, { likes: 7 });
    expect(view.store.getState().books.items).toEqual([saved]);
    expect(screen.queryByRole('button', { name: 'Unlike book' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Like book' }));
    expect(await screen.findByText('likes: 3')).toBeVisible();
    expect(bookService.update).toHaveBeenLastCalledWith(book.id, { likes: 18 });
    await act(async () => { await view.store.dispatch(initializeBooks()); });
    expect(screen.getByText('likes: 3')).toBeVisible();
    view.unmount();
    const fresh = renderWithProviders(<LikeButton booksId={book.id} />);
    await act(async () => { await fresh.store.dispatch(initializeBooks()); });
    expect(screen.getByText('likes: 3')).toBeVisible();
});

test('a pending like blocks rapid dispatches and remounted controls while other books remain usable', async () => {
    let finish: (value: Book) => void = () => { throw new Error('Request not started'); };
    vi.mocked(bookService.update).mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }))
        .mockResolvedValueOnce({ ...otherBook, likes: 8 });
    const view = renderWithProviders(<LikeButton booksId={book.id} />, { preloadedState: booksState([book, otherBook]) });
    act(() => {
        void view.store.dispatch(likeBook(book.id));
        void view.store.dispatch(likeBook(book.id));
    });
    expect(screen.getByRole('button', { name: 'Like book' })).toBeDisabled();
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('likes: 1')).toBeVisible();
    view.rerender(<Provider store={view.store}><LikeButton key="remounted" booksId={book.id} /></Provider>);
    fireEvent.click(screen.getByRole('button'));
    expect(bookService.update).toHaveBeenCalledTimes(1);
    await act(async () => { await view.store.dispatch(likeBook(otherBook.id)); });
    expect(view.store.getState().books.items[1]?.likes).toBe(8);
    await act(async () => finish({ ...book, likes: 9 }));
    expect(screen.getByText('likes: 9')).toBeVisible();
    expect(screen.getByRole('button')).toBeEnabled();
    expect(view.store.getState().books.pendingLikeIds).toEqual([]);
});

test.each([
    new ApiError('network', 'No response'),
    new ApiError('http', 'Unauthorized', { status: 401, data: {} }),
    new ApiError('invalid-response', 'Invalid JSON'),
])('a failed like preserves the count and unlocks a successful retry ($kind)', async (error) => {
    vi.mocked(bookService.update).mockRejectedValueOnce(error).mockResolvedValueOnce({ ...book, likes: 12 });
    const view = renderWithProviders(<><LikeButton booksId={book.id} /><Notification /></>, {
        preloadedState: booksState([book]),
    });
    fireEvent.click(screen.getByRole('button', { name: 'Like book' }));
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    expect(screen.getByText('likes: 1')).toBeVisible();
    expect(view.store.getState().books.items).toEqual([book]);
    expect(screen.getByRole('status')).toHaveTextContent(error.kind === 'http' ? 'You must log in'
        : error.kind === 'network' ? 'No response was received' : 'The like update could not be confirmed');
    fireEvent.click(screen.getByRole('button'));
    expect(await screen.findByText('likes: 12')).toBeVisible();
    expect(view.store.getState().books.pendingLikeIds).toEqual([]);
});

test.each([null, undefined])('missing or null likes render as zero and use the existing input contract (%s)', async (likes) => {
    vi.mocked(bookService.update).mockResolvedValue({ ...book, likes });
    renderWithProviders(<LikeButton booksId={book.id} />, { preloadedState: booksState([{ ...book, likes }]) });
    expect(screen.getByText('likes: 0')).toBeVisible();
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
    expect(bookService.update).toHaveBeenCalledWith(book.id, { likes: 1 });
    expect(screen.getByText('likes: 0')).toBeVisible();
});

test('a like response does not recreate a book removed while the request was pending', async () => {
    let finish: (value: Book) => void = () => { throw new Error('Request not started'); };
    vi.mocked(bookService.update).mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
    const view = renderWithProviders(<LikeButton booksId={book.id} />, { preloadedState: booksState([book]) });
    fireEvent.click(screen.getByRole('button'));
    act(() => { view.store.dispatch(removeBook(book.id)); });
    await act(async () => finish({ ...book, likes: 2 }));
    expect(view.store.getState().books.items).toEqual([]);
    expect(view.store.getState().books.pendingLikeIds).toEqual([]);
    expect(screen.getByRole('button')).toBeDisabled();
});
