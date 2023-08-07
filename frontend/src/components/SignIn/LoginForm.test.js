import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
    it('renders without crashing', () => {
        render(<LoginForm handleLogin={() => { }} showSignUp={false} />);
    });

    it('displays "Sign up" button text when showSignUp prop is true', () => {

        //Arrange:
        const handleLoginMock = jest.fn();
        const showSignUp = true;

        //Act:
        render(<LoginForm handleLogin={handleLoginMock} showSignUp={showSignUp} />);

        //Assert:
        const submitButton = screen.getByText('Sign up');
        expect(submitButton).toBeInTheDocument();
    });

    it('displays "Login" button text when showSignUp prop is false', () => {

        //Arrange:
        const handleLoginMock = jest.fn();
        const showSignUp = false;

        //Act:
        render(<LoginForm handleLogin={handleLoginMock} showSignUp={showSignUp} />);

        //Assert:
        const submitButton = screen.getByText('Login');
        expect(submitButton).toBeInTheDocument();
    });

    it('calls handleLogin with correct user credentials on form submission', () => {

        //Arrange:

        const handleLoginMock = jest.fn();
        const showSignUp = true;

        //Act:
        render(<LoginForm handleLogin={handleLoginMock} showSignUp={showSignUp} />);

        const usernameInput = screen.getByLabelText(/username/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByText('Sign up');

        fireEvent.change(usernameInput, { target: { value: 'testuser' } });
        fireEvent.change(emailInput, { target: { value: 'test@user.com' } });
        fireEvent.change(passwordInput, { target: { value: 'TestPassw123!' } });

        fireEvent.click(submitButton);

        // Assert:
        expect(handleLoginMock).toHaveBeenCalledWith({
            username: 'testuser',
            email: 'test@user.com',
            password: 'TestPassw123!',
        });
    });
});