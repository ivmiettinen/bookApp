import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

vi.mock('../../services/books', () => ({
    default: { create: vi.fn(), remove: vi.fn(), update: vi.fn(), setToken: vi.fn() },
}));

const book: Book = { id: 'one', title: 'Zulu', author: 'Alpha', url: 'https://example.com', likes: 1 };
const otherBook: Book = { ...book, id: 'two', title: 'Alpha', author: 'Zulu', likes: 4 };
const booksState = (items: Book[]) => ({ books: { items, status: 'succeeded' as const, error: null } });

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
        <LikeButton booksId="missing" initialLikes={null} /></>;
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
});
