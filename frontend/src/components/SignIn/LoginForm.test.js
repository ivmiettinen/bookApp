import React from 'react';
import { render, screen } from '@testing-library/react';
// import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
    it('renders without crashing', () => {
        render(<LoginForm handleLogin={() => { }} showSignUp={false} />);
    });

    it('displays "Sign up" button text when showSignUp prop is true', () => {
        const handleLoginMock = jest.fn();
        const showSignUp = true;

        render(<LoginForm handleLogin={handleLoginMock} showSignUp={showSignUp} />);

        const submitButton = screen.getByText('Sign up');
        expect(submitButton).toBeInTheDocument();
    });

    it('displays "Login" button text when showSignUp prop is false', () => {
        const handleLoginMock = jest.fn();
        const showSignUp = false;

        render(<LoginForm handleLogin={handleLoginMock} showSignUp={showSignUp} />);

        const submitButton = screen.getByText('Login');
        expect(submitButton).toBeInTheDocument();
    });
});