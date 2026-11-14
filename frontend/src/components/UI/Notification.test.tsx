import { StrictMode } from 'react';
import { act, cleanup, screen } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { uiActions } from '../../store/ui-slice';
import type { Notification as NotificationData, NotificationStatus } from '../../store/ui-slice';
import { login } from '../../store/user-slice';
import Notification from './Notification';

const saved: NotificationData = { status: 'success', message: 'Book update' };

const advanceTime = (milliseconds: number) => {
    act(() => vi.advanceTimersByTime(milliseconds));
};

beforeEach(() => vi.useFakeTimers());

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

test.each<NotificationStatus>(['success', 'error'])('renders a %s notification message', (status) => {
    renderWithProviders(<Notification />, {
        preloadedState: { ui: { notification: { ...saved, status } } },
    });

    expect(screen.getByRole('alert')).toHaveTextContent('Book update');
});

test('an empty notification state renders no alert and starts no timer', () => {
    renderWithProviders(<Notification />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
});

test('a notification stays visible for five seconds and resets the store exactly once', () => {
    const { store } = renderWithProviders(<Notification />);
    act(() => { store.dispatch(uiActions.showNotification(saved)); });
    const onStoreChange = vi.fn();
    const unsubscribe = store.subscribe(onStoreChange);

    advanceTime(4999);
    expect(screen.getByRole('alert')).toHaveTextContent(saved.message);
    expect(onStoreChange).not.toHaveBeenCalled();

    advanceTime(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(store.getState().ui.notification).toBeNull();
    expect(onStoreChange).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    unsubscribe();
});

test.each<{ name: string; next: NotificationData }>([
    { name: 'a different message', next: { ...saved, message: 'Another book update' } },
    { name: 'a different status', next: { ...saved, status: 'error' } },
    { name: 'identical message and status', next: { ...saved } },
])('$name gets a full duration and replaces the previous timer', ({ next }) => {
    const { store } = renderWithProviders(<Notification />);
    act(() => { store.dispatch(uiActions.showNotification(saved)); });
    advanceTime(3000);
    act(() => { store.dispatch(uiActions.showNotification(next)); });

    expect(screen.getByRole('alert')).toHaveTextContent(next.message);
    expect(vi.getTimerCount()).toBe(1);
    advanceTime(2000);
    expect(screen.getByRole('alert')).toHaveTextContent(next.message);
    expect(store.getState().ui.notification).toEqual(next);
    advanceTime(2999);
    expect(screen.getByRole('alert')).toHaveTextContent(next.message);
    advanceTime(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(store.getState().ui.notification).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
});

test('resetting a notification clears its timer and a later notification can appear', () => {
    const { store } = renderWithProviders(<Notification />);
    act(() => { store.dispatch(uiActions.showNotification(saved)); });
    advanceTime(1000);
    act(() => { store.dispatch(uiActions.resetNotification()); });

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBe(0);
    advanceTime(5000);
    act(() => { store.dispatch(uiActions.showNotification(saved)); });
    advanceTime(4999);
    expect(screen.getByRole('alert')).toHaveTextContent(saved.message);
    advanceTime(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('unmount clears the timer so it cannot reset a later notification in the store', () => {
    const { store, unmount } = renderWithProviders(<Notification />);
    act(() => { store.dispatch(uiActions.showNotification(saved)); });
    advanceTime(3000);
    unmount();

    expect(vi.getTimerCount()).toBe(0);
    const next: NotificationData = { status: 'error', message: 'New notification after unmount' };
    store.dispatch(uiActions.showNotification(next));
    advanceTime(10000);
    expect(store.getState().ui.notification).toEqual(next);
});

test('StrictMode effect cleanup leaves only one active timer', () => {
    const { store } = renderWithProviders(<StrictMode><Notification /></StrictMode>, {
        preloadedState: { ui: { notification: saved } },
    });

    expect(vi.getTimerCount()).toBe(1);
    advanceTime(4999);
    expect(screen.getByRole('alert')).toHaveTextContent(saved.message);
    advanceTime(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(store.getState().ui.notification).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
});

test('unrelated store updates do not extend the notification duration', () => {
    const { store } = renderWithProviders(<Notification />);
    act(() => { store.dispatch(uiActions.showNotification(saved)); });
    advanceTime(3000);
    act(() => { store.dispatch(login('Reader')); });
    advanceTime(1999);

    expect(screen.getByRole('alert')).toHaveTextContent(saved.message);
    advanceTime(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
