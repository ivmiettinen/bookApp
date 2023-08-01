import React, { useState, useImperativeHandle } from 'react';
import classes from './Togglable.module.css';
import PropTypes from 'prop-types';

const Togglable = React.forwardRef((props, ref) => {
    const [visible, setVisible] = useState(false);

    const hideWhenVisible = { display: visible ? 'none' : '' };
    const showWhenVisible = { display: visible ? '' : 'none' };

    const toggleVisibility = () => {
        setVisible(!visible);
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

Togglable.propTypes = {
    buttonLabel: PropTypes.string.isRequired,
};

Togglable.displayName = 'Togglable';

export default Togglable;
