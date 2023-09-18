import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import AuthForm from './AuthForm';
import { uiActions } from '../../store/ui-slice';

describe('AuthForm', () => {
    let store;

    beforeEach(() => {
        const mockStore = configureStore();
        store = mockStore({});
    });


    afterEach(() => {
        store.clearActions();
    });


    it('renders without crashing', () => {
        render(<Provider store={store}><AuthForm handleLogin={() => { }} showSignUp={false} /></Provider>);
    });

    it('displays "Sign up" button text when showSignUp prop is true', () => {

        //Arrange:
        const handleLoginMock = jest.fn();
        const showSignUp = true;

        //Act:
        render(<Provider store={store}><AuthForm handleLogin={handleLoginMock} showSignUp={showSignUp} /></Provider>);

        //Assert:
        const submitButton = screen.getByText('Sign up');
        expect(submitButton).toBeInTheDocument();
    });

    it('displays "Login" button text when showSignUp prop is false', () => {

        //Arrange:
        const handleLoginMock = jest.fn();
        const showSignUp = false;

        //Act:
        render(<Provider store={store}><AuthForm handleLogin={handleLoginMock} showSignUp={showSignUp} /></Provider>);

        //Assert:
        const submitButton = screen.getByText('Login');
        expect(submitButton).toBeInTheDocument();
    });

    it('calls handleLogin with correct user credentials on form submission', () => {

        //Arrange:

        const handleLoginMock = jest.fn();
        const showSignUp = true;

        //Act:
        render(<Provider store={store}><AuthForm handleLogin={handleLoginMock} showSignUp={showSignUp} /></Provider>);

        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByText('Sign up');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
        fireEvent.change(passwordInput, { target: { value: 'TestPassw123!' } });

        fireEvent.click(submitButton);

        // Assert:
        expect(handleLoginMock).toHaveBeenCalledTimes(1);
        expect(handleLoginMock).toHaveBeenCalledWith({
            username: 'testuser',
            email: 'test@user.com',
            password: 'TestPassw123!',
        });
    });

    it('displays error message for too short username when signing up', () => {

        //Arrange:
        const handleLoginMock = jest.fn();
        const showSignUp = true;

        //Act:
        render(<Provider store={store}><AuthForm handleLogin={handleLoginMock} showSignUp={showSignUp} /></Provider>);

        const usernameInput = screen.getByLabelText(/username/i);
        const submitButton = screen.getByText('Sign up');

        fireEvent.change(usernameInput, { target: { value: 'ab' } });
        fireEvent.click(submitButton);

        // Assert:
        const actions = store.getActions();
        expect(actions).toHaveLength(1);
        expect(actions[0]).toEqual(
            uiActions.showNotification({
                status: 'error',
                message: 'Username must be at least 3 characters long.'
            }));
    });

    it('displays error message for too weak password when signing up', () => {

        //Arrange:
        const handleLoginMock = jest.fn();
        const setErrorMessageMock = jest.fn();
        const showSignUp = true;

        //Act:
        render(
            <Provider store={store}>
                <AuthForm
                    handleLogin={handleLoginMock}
                    showSignUp={showSignUp}
                    setErrorMessage={setErrorMessageMock}
                />
            </Provider>
        );

        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByText('Sign up');

        fireEvent.change(usernameInput, { target: { value: 'tester' } });
        fireEvent.change(emailInput, { target: { value: 'test@address.com' } });
        fireEvent.change(passwordInput, { target: { value: 'testpass' } });
        fireEvent.click(submitButton);

        // Assert:
        const actions = store.getActions();
        expect(actions).toHaveLength(1);
        expect(actions[0]).toEqual(
            uiActions.showNotification({
                status: 'error',
                message: 'Password must be 8 letters long and have AT LEAST: 1 lowercase, 1 uppercase, 1 number and 1 symbol.'
            }));
    });
});