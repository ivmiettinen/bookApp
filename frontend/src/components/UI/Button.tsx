import type { ComponentPropsWithoutRef } from 'react';
import classes from './Button.module.css';

type ButtonProps = ComponentPropsWithoutRef<'button'>;

const Button = ({ className = '', type = 'button', children, ...props }: ButtonProps) => {
    return (
        <button
            {...props}
            className={`${classes.button} ${className}`}
            type={type}
        >
            {children}
        </button>
    );
};

export default Button;
