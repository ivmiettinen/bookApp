import { fireEvent, screen } from '@testing-library/react';
import { Route } from 'react-router-dom';
import AuthButtons from './AuthButtons';
import { renderWithProviders } from '../../test-utils';

const renderButtons = () => {
    renderWithProviders(
        <>
            <AuthButtons />
            <Route path="/signup"><p>Signup route</p></Route>
            <Route path="/login"><p>Login route</p></Route>
        </>,
        { route: '/auth' }
    );
};

test('Sign up navigates to signup', () => {
    renderButtons();
    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));
    expect(screen.getByText('Signup route')).toBeInTheDocument();
});

test('Login navigates to login', () => {
    renderButtons();
    fireEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(screen.getByText('Login route')).toBeInTheDocument();
});
