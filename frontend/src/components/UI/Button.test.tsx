import { render, fireEvent } from '@testing-library/react';
import Button from './Button';
import userEvent from '@testing-library/user-event';
import type { FormEvent } from 'react';
import { expect, test, vi } from 'vitest';

test('renders Button component with children', () => {
    // Arrange
    const children = 'Render children';

    // Act
    const { getByText } = render(<Button>{children}</Button>);

    // Assert
    const buttonElement = getByText(children);
    expect(buttonElement).toBeInTheDocument();
});

test('renders Button component with CSS classes', () => {
    // Arrange
    const className = 'just-a-test';

    // Act
    const { container } = render(<Button className={className}>Button</Button>);

    // Assert
    const buttonElement = container.querySelector('button');
    expect(buttonElement?.classList.contains(className)).toBe(true);
});

test('calls onClick event handler when button is clicked', () => {
    // Arrange
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Button</Button>);
    const buttonElement = getByRole('button', { name: 'Button' });

    // Act
    fireEvent.click(buttonElement);

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
});

test('forwards native attributes and prevents clicks while disabled', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { getByRole, rerender } = render(
        <Button disabled aria-label="Save book" aria-describedby="save-help"
            name="action" value="save" title="Save changes" onClick={onClick}>
            Save
        </Button>
    );
    const button = getByRole('button', { name: 'Save book' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-describedby', 'save-help');
    expect(button).toHaveAttribute('name', 'action');
    expect(button).toHaveAttribute('value', 'save');
    expect(button).toHaveAttribute('title', 'Save changes');
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();

    rerender(<Button onClick={onClick}>Save</Button>);
    await user.click(getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledTimes(1);
});

test('defaults to button and submits a form only with an explicit submit type', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const { getByRole } = render(
        <form onSubmit={onSubmit}>
            <Button>Cancel</Button>
            <Button type="submit">Save</Button>
        </form>
    );

    expect(getByRole('button', { name: 'Cancel' })).toHaveAttribute('type', 'button');
    await user.click(getByRole('button', { name: 'Cancel' }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
});
