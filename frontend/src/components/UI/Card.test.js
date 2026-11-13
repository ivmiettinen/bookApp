import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import Card from './Card';

test('renders Card component with children', () => {

    // Arrange
    const children = 'render children';

    // Act
    const { getByText } = render(<Card>{children}</Card>);

    // Assert
    const cardElement = getByText(children);
    expect(cardElement).toBeInTheDocument();
});
