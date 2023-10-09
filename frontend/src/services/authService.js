import loginService from './login';
import signUpService from './signUp';
import bookService from './books';
import { uiActions } from '../store/ui-slice';
import { login, logout } from '../store/user-slice';

export const handleLogOut = (history) => {
    return async (dispatch) => {

        try {
            await dispatch(logout());
            dispatch(uiActions.showNotification({
                status: 'success',
                message: 'Successful log in',
            }));
            window.localStorage.clear();
            bookService.setToken(null);
            dispatch(uiActions.showNotification({
                status: 'success',
                message: 'Successfully logged out',
            }));
            history.push('/auth');
        } catch (exception) 
        {
            dispatch(uiActions.showNotification({
                status: 'error',
                message: 'Error on log out',
            }));
        }
    };
};

export const handleAuth = (userInfo, showSignUp, history) => {
    return async (dispatch) => {

        let user;
        try {
            if (showSignUp) {
                user = await signUpService(userInfo);
            } else {
                user = await loginService(userInfo);
            }
            window.localStorage.setItem(
                'loggedBookappUser',
                JSON.stringify(user)
            );
            bookService.setToken(user.token);

            await dispatch(login(userInfo.username));
            dispatch(uiActions.showNotification({
                status: 'success',
                message: 'Successful log in',
            }));
            history.push('/books');
        } catch (exception) {
            if (exception?.response?.data && JSON.stringify(exception.response.data).includes('unique')) {
                dispatch(uiActions.showNotification({
                    status: 'error',
                    message: `Username '${userInfo.username}' is already in use`,
                }));
            } else if (
                exception?.response?.data && JSON.stringify(exception.response.data).includes(
                    'invalid username or password'
                )
            ) {
                dispatch(uiActions.showNotification({
                    status: 'error',
                    message: 'Invalid username or password',
                }));
            }
        }
    };
};