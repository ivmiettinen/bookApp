import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, expectTypeOf, test, vi } from 'vitest';
import { renderWithProviders } from '../test-utils';
import bookService from '../services/books';
import type { Book } from '../types/api';
import { setupStore } from './index';
import type { AppDispatch, RootState } from './index';
import { useAppDispatch, useAppSelector } from './hooks';
import { addLike, createBook, initializeBooks, isSortKey, sortBooks } from './book-slice';
import type { SortKey } from './book-slice';
import { uiActions } from './ui-slice';
import type { NotificationStatus } from './ui-slice';
import { login } from './user-slice';
import useBookActions from './useBookActions';
import BookForm from '../components/Books/BookForm';
import BookOptions from '../components/Books/BookOptions';

vi.mock('../services/books', () => ({
    default: { getAll: vi.fn(), create: vi.fn(), remove: vi.fn() },
}));

const book: Book = { id: 'book-1', title: 'Zulu', author: 'Alpha', url: 'https://example.com', likes: 1 };
const otherBook: Book = { ...book, id: 'book-2', title: 'Alpha', author: 'Zulu', likes: 3 };

const BookControls = () => {
    const { deleteBook } = useBookActions();
    const books = useAppSelector((state) => state.books);
    const notification = useAppSelector((state) => state.ui.notification);
    const dispatch = useAppDispatch();

    return <>
        <button onClick={() => dispatch(initializeBooks())}>Load books</button>
        <BookOptions />
        <BookForm />
        <ul>{books.map((item) => <li key={item.id}>
            {item.title}
            <button onClick={() => deleteBook(item.id)}>Delete {item.title}</button>
        </li>)}</ul>
        {notification && <p role="status">{notification.message}</p>}
    </>;
};

beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
});

afterEach(() => vi.restoreAllMocks());

test('each render gets an isolated store with the production reducers', () => {
    const first = renderWithProviders(<p>First</p>).store;
    const second = renderWithProviders(<p>Second</p>).store;
    first.dispatch(createBook(book));
    first.dispatch(login('Reader'));
    first.dispatch(uiActions.showNotification({ status: 'success', message: 'Saved' }));
    expect(first.getState().books).toEqual([book]);
    expect(first.getState().user).toEqual({ user: 'Reader', isAuthenticated: true });
    expect(first.getState().ui.notification?.message).toBe('Saved');
    expect(second.getState()).toEqual(setupStore().getState());
});

test('typed dispatch awaits initialization and selectors display the loaded books', async () => {
    vi.mocked(bookService.getAll).mockResolvedValue([book, otherBook]);
    renderWithProviders(<BookControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Load books' }));
    await screen.findByRole('button', { name: 'Delete Zulu' });
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    const store = setupStore();
    await expect(store.dispatch(initializeBooks())).resolves.toBeUndefined();
    expect(store.getState().books).toEqual([book, otherBook]);
});

test('initialization preserves the rejected promise for its caller', async () => {
    const failure = new Error('Network unavailable');
    vi.mocked(bookService.getAll).mockRejectedValue(failure);
    const store = setupStore();
    await expect(store.dispatch(initializeBooks())).rejects.toBe(failure);
    expect(store.getState().books).toEqual([]);
});

test('sorting through the selector orders the rendered books by each supported key', () => {
    renderWithProviders(<BookControls />, { preloadedState: { books: [book, otherBook] } });
    for (const [key, titles] of [
        ['title', ['Alpha', 'Zulu']],
        ['author', ['Zulu', 'Alpha']],
        ['likes', ['Alpha', 'Zulu']],
    ]) {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: key } });
        expect(screen.getAllByRole('listitem').map((item) => item.firstChild?.textContent)).toEqual(titles);
    }
    expect(isSortKey('title')).toBe(true);
    expect(isSortKey('author')).toBe(true);
    expect(isSortKey('likes')).toBe(true);
    expect(isSortKey('url')).toBe(false);
    expect(isSortKey('')).toBe(false);
});

test('adding and deleting a book updates the visible list and notifications', async () => {
    vi.mocked(bookService.create).mockResolvedValue(book);
    vi.mocked(bookService.remove).mockResolvedValue(undefined);
    renderWithProviders(<BookControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Add a book' }));
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: book.title } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: book.author } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: book.url } });
    fireEvent.click(screen.getByRole('button', { name: 'create' }));
    await screen.findByRole('button', { name: 'Delete Zulu' });
    expect(screen.getByRole('status')).toHaveTextContent('A new book Zulu by Alpha added');
    expect(screen.getByRole('button', { name: 'Add a book' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Zulu' }));
    await waitFor(() => expect(screen.queryByRole('listitem')).not.toBeInTheDocument());
    expect(screen.getByRole('status')).toHaveTextContent('The book Zulu was successfully deleted');
});

test('a failed book creation keeps the list empty and shows the existing error', async () => {
    vi.mocked(bookService.create).mockRejectedValue(new Error('Unauthorized'));
    renderWithProviders(<BookControls />);
    fireEvent.click(screen.getByRole('button', { name: 'Add a book' }));
    fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: book.title } });
    fireEvent.change(screen.getAllByRole('textbox')[1], { target: { value: book.author } });
    fireEvent.change(screen.getAllByRole('textbox')[2], { target: { value: book.url } });
    fireEvent.click(screen.getByRole('button', { name: 'create' }));
    expect(await screen.findByRole('status')).toHaveTextContent('You must log in before you can add books');
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
});

test('action payloads and async dispatch retain their precise types', () => {
    expectTypeOf<RootState>().toEqualTypeOf<ReturnType<ReturnType<typeof setupStore>['getState']>>();
    expectTypeOf<ReturnType<typeof useAppDispatch>>().toEqualTypeOf<AppDispatch>();
    expectTypeOf(createBook).parameter(0).toEqualTypeOf<Book>();
    expectTypeOf(addLike).parameter(0).toEqualTypeOf<Book>();
    expectTypeOf(sortBooks).parameter(0).toEqualTypeOf<SortKey>();
    expectTypeOf(uiActions.showNotification).parameter(0).toEqualTypeOf<{ status: NotificationStatus; message: string }>();
    expectTypeOf<NotificationStatus>().toEqualTypeOf<'success' | 'error'>();
    expectTypeOf(login).parameter(0).toEqualTypeOf<string>();
    expectTypeOf(() => setupStore().dispatch(initializeBooks())).returns.toEqualTypeOf<Promise<void>>();
});



