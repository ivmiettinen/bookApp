import type { ReactNode } from 'react';
import classes from './Card.module.css';

interface CardProps {
    children: ReactNode;
    className?: string;
}

const Card = (props: CardProps) => {
    return (
        <div className={`${classes.card} ${props.className}`}>
            {props.children}
        </div>
    );
};

export default Card;
