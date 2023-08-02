import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';
import classes from './Button.module.css';

test('renders Button component with children', () => {
    screen.debug();
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
    expect(buttonElement).toHaveClass(className);
    expect(buttonElement).toHaveClass(classes.button);
});

test('calls onClick event handler when button is clicked', () => {
    // Arrange
    const onClick = jest.fn();
    const { container } = render(<Button onClick={onClick}>Button</Button>);
    const buttonElement = container.querySelector('button');

    // Act
    fireEvent.click(buttonElement);

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
});
