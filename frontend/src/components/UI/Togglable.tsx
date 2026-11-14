import React, { useState, useImperativeHandle } from 'react';
import type { ReactNode } from 'react';
import type { TogglableHandle } from '../../types/ui';
import classes from './Togglable.module.css';

interface TogglableProps {
    buttonLabel: string;
    children: ReactNode;
    className?: string;
}

const Togglable = React.forwardRef<TogglableHandle, TogglableProps>((props, ref) => {
    const [visible, setVisible] = useState(false);

    const hideWhenVisible = { display: visible ? 'none' : '' };
    const showWhenVisible = { display: visible ? '' : 'none' };

    const toggleVisibility = () => {
        setVisible((previousVisible) => !previousVisible);
    };

    useImperativeHandle(ref, () => {
        return {
            toggleVisibility,
        };
    });

    return (
        <div className={classes.togglableDiv}>
            <div style={showWhenVisible}>
                {props.children}
                <button
                    className={classes.buttonHide}
                    onClick={toggleVisibility}
                >
                    hide
                </button>
            </div>
            <div style={hideWhenVisible} className={classes.hideWhenVisible}>
                <button className={props.className} onClick={toggleVisibility}>
                    {props.buttonLabel}
                </button>
            </div>
        </div>
    );
});

Togglable.displayName = 'Togglable';

export default Togglable;
