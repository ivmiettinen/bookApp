import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';
import LogOutUser from './LogOutUser';

const mockPush = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockPush,
    }),
}));

describe('LogOutUser', () => {
    let container;

    const mockHandler = jest.fn();

    const mockHistory = {
        push: jest.fn(),
    };

    const user = {
        username: 'Tester',
    };

    beforeEach(() => {
        container = render(
            <LogOutUser
                user={user}
                logOut={mockHandler}
                mockHistory={mockHistory}
            />
        ).container;
    });

    test('renders user that is logged in', () => {
        // screen.debug();

        //Arrange:
        const logOutUser = container.querySelector('.LogOutUser');

        //Assert:
        expect(logOutUser).toHaveTextContent(
            'User Tester is currently logged in'
        );
    });

    test('renders Log out button', () => {
        //Arrange
        const logOutButton = screen.getByText('Log out');

        //Act
        fireEvent.click(logOutButton);

        //Assert:
        expect(mockHandler).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith('/auth');
    });
});
