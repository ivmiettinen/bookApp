import { act, screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import { login } from '../../store/user-slice';
import Layout from './Layout';
import { expect, test } from 'vitest';

test('renders main content and navigation based on the store user', () => {
    const { store } = renderWithProviders(<Layout><p>Page content</p></Layout>);

    expect(screen.getByRole('main')).toHaveTextContent('Page content');
    expect(screen.getByRole('link', { name: 'Auth' })).toHaveAttribute('href', '/auth');
    expect(screen.getByRole('link', { name: 'Books' })).toHaveAttribute('href', '/books');
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about');

    act(() => store.dispatch(login('reader')));
    expect(screen.getByRole('link', { name: 'Logout' })).toHaveAttribute('href', '/logout');
    expect(screen.queryByRole('link', { name: 'Auth' })).not.toBeInTheDocument();
});
