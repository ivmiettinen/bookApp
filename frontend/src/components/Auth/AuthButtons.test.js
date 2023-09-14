import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import AuthButtons from './AuthButtons';

const mockPush = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockPush,
    }),
}));

const setupAuthComponent = () => {
    const setShowSignUp = jest.fn();
    const setShowLogIn = jest.fn();
    const utils = render(
        <AuthButtons setShowSignUp={setShowSignUp} setShowLogIn={setShowLogIn} />
    );

    return {
        ...utils,
        setShowSignUp,
        setShowLogIn,
    };
};

describe('AuthButtons component', () => {
    it('should call the setShowSignUp function and navigate to signup page when "Sign up" button is clicked', () => {

        //Arrange:
        const { setShowLogIn, setShowSignUp } = setupAuthComponent();
        const signUpButton = screen.getByText('Sign up');

        //Act:
        fireEvent.click(signUpButton);

        //Assert:
        expect(setShowLogIn).toHaveBeenCalledWith(false);
        expect(setShowSignUp).toHaveBeenCalledWith(true);
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/signup');
    });

    it('should call the setShowLogIn function and navigate to login page when "Login" button is clicked', () => {

        //Arrange:
        const { setShowLogIn, setShowSignUp } = setupAuthComponent();
        const loginButton = screen.getByText('Login');

        //Act:
        fireEvent.click(loginButton);

        //Assert:
        expect(setShowLogIn).toHaveBeenCalledWith(true);
        expect(setShowSignUp).toHaveBeenCalledWith(false);
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/login');
    });
});
