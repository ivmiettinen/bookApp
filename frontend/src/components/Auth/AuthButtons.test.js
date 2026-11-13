import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import AuthButtons from './AuthButtons';
import { renderWithProviders } from '../../test-utils';

const renderButtons = () => {
    const setShowSignUp = jest.fn();
    const setShowLogIn = jest.fn();
    renderWithProviders(
        <>
            <AuthButtons setShowSignUp={setShowSignUp} setShowLogIn={setShowLogIn} />
            <Route path="/signup"><p>Signup route</p></Route>
            <Route path="/login"><p>Login route</p></Route>
        </>,
        { route: '/auth' }
    );
    return { setShowSignUp, setShowLogIn };
};

test('Sign up selects signup mode and navigates to signup', () => {
    const { setShowSignUp, setShowLogIn } = renderButtons();
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(setShowSignUp).toHaveBeenCalledWith(true);
    expect(setShowLogIn).toHaveBeenCalledWith(false);
    expect(screen.getByText('Signup route')).toBeInTheDocument();
});

test('Login selects login mode and navigates to login', () => {
    const { setShowSignUp, setShowLogIn } = renderButtons();
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(setShowSignUp).toHaveBeenCalledWith(false);
    expect(setShowLogIn).toHaveBeenCalledWith(true);
    expect(screen.getByText('Login route')).toBeInTheDocument();
});
