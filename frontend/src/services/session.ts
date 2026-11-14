import type { AppThunk } from '../store';
import { login, logout } from '../store/user-slice';
import { uiActions } from '../store/ui-slice';
import type { AuthResponse } from '../types/api';
import { ApiError } from './apiError';
import { parseAuth } from './apiValidation';
import bookService from './books';

const sessionKey = 'loggedBookappUser';

export const clearSession = (): AppThunk<boolean> => (dispatch) => {
    bookService.setToken(null);
    dispatch(logout());
    try {
        window.localStorage.removeItem(sessionKey);
        return true;
    } catch {
        return false;
    }
};

export const activateSession = (session: AuthResponse): AppThunk => (dispatch) => {
    bookService.setToken(session.token);
    dispatch(login(session.username));
};

export const saveSession = (value: AuthResponse): AppThunk => (dispatch) => {
    const session = parseAuth(value);
    // Persist first: a storage failure must not leave a partially activated login.
    window.localStorage.setItem(sessionKey, JSON.stringify(session));
    dispatch(activateSession(session));
};

export const restoreSession = (): AppThunk => (dispatch) => {
    try {
        const stored = window.localStorage.getItem(sessionKey);
        if (stored === null) {
            bookService.setToken(null);
            dispatch(logout());
            return;
        }
        const value: unknown = JSON.parse(stored);
        dispatch(activateSession(parseAuth(value)));
    } catch {
        dispatch(clearSession());
        dispatch(uiActions.showNotification({
            status: 'error', message: 'Could not restore your session. Please log in again.',
        }));
    }
};

export const handleSessionError = (
    error: unknown, message = 'Your session was rejected. Please log in again.',
): AppThunk<boolean> => (dispatch) => {
    if (!(error instanceof ApiError) || error.kind !== 'http' || error.response?.status !== 401) {
        return false;
    }
    const removed = dispatch(clearSession());
    dispatch(uiActions.showNotification({
        status: 'error',
        message: removed ? message : `${message} Could not remove the saved session.`,
    }));
    return true;
};
