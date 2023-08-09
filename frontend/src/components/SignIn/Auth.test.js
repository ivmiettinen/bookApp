import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom'; // To mock the router
import Auth from './Auth';

// Mock the useHistory hook
const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockPush,
    }),
}));

const mockHistory = {
    push: jest.fn(),
};

describe('Auth component', () => {
    it('should call the setShowSignUp function and navigate to signup page when "Sign up" button is clicked', () => {

        //Arrange
        const setShowSignUp = jest.fn();
        const setShowLogIn = jest.fn();
        const { getByText } = render(
            <MemoryRouter>
                <Auth setShowSignUp={setShowSignUp} setShowLogIn={setShowLogIn} mockHistory={mockHistory} />
            </MemoryRouter>
        );


        const signUpButton = getByText('Sign up');

        //Act
        fireEvent.click(signUpButton);

        //Assert:
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/signup');
    });

});