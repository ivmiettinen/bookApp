import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../test-utils';
import type { NotificationStatus } from '../../store/ui-slice';
import Notification from './Notification';

test.each<NotificationStatus>(['success', 'error'])('renders a %s notification message', (status) => {
    renderWithProviders(<Notification status={status} message="Book update" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Book update');
});
