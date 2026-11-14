import type { History } from 'history';
import type { AppThunk } from '../store';
import type { SignUpInput } from '../types/api';
import loginService from './login';
import signUpService from './signUp';
import { ApiError } from './apiError';
import { clearSession, handleSessionError, saveSession } from './session';
import { uiActions } from '../store/ui-slice';

export const handleLogOut = (history: History): AppThunk => (dispatch) => {
    const removed = dispatch(clearSession());
    dispatch(uiActions.showNotification({
        status: removed ? 'success' : 'error',
        message: removed
            ? 'Successfully logged out'
            : 'Logged out for this visit. Could not remove the saved session.',
    }));
    history.push('/auth');
};

function authErrorMessage(error: unknown, username: string): string {
    if (error instanceof ApiError && error.kind === 'http') {
        const data = error.response?.data;
        if (typeof data === 'object' && data !== null && 'error' in data && typeof data.error === 'string') {
            if (data.error === 'invalid username or password') return 'Invalid username or password';
            if (error.response?.status === 400 && /username.*unique/i.test(data.error)) {
                return `Username '${username}' is already in use`;
            }
        }
    }
    return 'Could not authenticate. Please try again.';
}

export const handleAuth = (
    userInfo: SignUpInput, showSignUp: boolean, history: History,
): AppThunk<Promise<void>> => async (dispatch) => {
    try {
        const session = await (showSignUp ? signUpService(userInfo) : loginService(userInfo));
        try {
            dispatch(saveSession(session));
        } catch {
            dispatch(clearSession());
            dispatch(uiActions.showNotification({
                status: 'error', message: 'Could not save your session. Please allow browser storage and try again.',
            }));
            return;
        }
        dispatch(uiActions.showNotification({ status: 'success', message: 'Successful log in' }));
        history.push('/books');
    } catch (error: unknown) {
        const message = authErrorMessage(error, userInfo.username);
        if (dispatch(handleSessionError(error, message))) return;
        dispatch(uiActions.showNotification({
            status: 'error', message,
        }));
    }
};
