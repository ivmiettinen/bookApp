import { createRef } from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TogglableHandle } from '../../types/ui';
import Togglable from './Togglable';
import { expect, test } from 'vitest';


test('shows and hides content with buttons without a ref', async () => {
    const user = userEvent.setup();
    render(<Togglable buttonLabel="Show details"><p>Book details</p></Togglable>);

    expect(screen.getByText('Book details')).not.toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Show details' }));
    expect(screen.getByText('Book details')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Show details' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'hide' }));
    expect(screen.getByText('Book details')).not.toBeVisible();
    expect(screen.getByRole('button', { name: 'Show details' })).toBeVisible();
});

test('exposes a typed ref and clears it on unmount for safe optional calls', () => {
    const ref = createRef<TogglableHandle>();
    expect(ref.current).toBeNull();
    ref.current?.toggleVisibility();

    const { unmount } = render(
        <Togglable ref={ref} buttonLabel="Show details"><p>Book details</p></Togglable>
    );
    expect(ref.current).not.toBeNull();
    act(() => ref.current?.toggleVisibility());
    expect(screen.getByText('Book details')).toBeVisible();
    act(() => ref.current?.toggleVisibility());
    expect(screen.getByText('Book details')).not.toBeVisible();

    unmount();
    expect(ref.current).toBeNull();
    ref.current?.toggleVisibility();
});

test('applies every ref toggle when React batches updates', () => {
    const ref = createRef<TogglableHandle>();
    render(<Togglable ref={ref} buttonLabel="Show details"><p>Book details</p></Togglable>);

    act(() => {
        ref.current?.toggleVisibility();
        ref.current?.toggleVisibility();
    });
    expect(screen.getByText('Book details')).not.toBeVisible();
});
