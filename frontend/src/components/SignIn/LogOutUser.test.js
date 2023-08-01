import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';
import LogOutUser from './LogOutUser';
import userEvent from '@testing-library/user-event';
import Button from '../UI/Button';

describe('<Togglable />', () => {
    let container;

    const mockHandler = jest.fn();

    // Mock history object
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
        //Arrange:
        const logOutButton = screen.getByText('Log out');

        //Assert:
        expect(logOutButton).toBeDefined();
    });

    

    // test('clicking the logout button calls event handler once', async () => {
    //     screen.debug();

    //     const mockHandler = jest.fn();

    //     const user = {
    //         username: 'Tester',
    //     };

    //     render(<LogOutUser user={user} logOut={mockHandler} />);

    //     // const testUser = userEvent.setup();
    //     // await testUser.click(logOutButton);

    //      expect(logOutButton).toBeDefined();

    //     // expect(mockHandler.mock.calls).toHaveLength(1);
    // });
});
