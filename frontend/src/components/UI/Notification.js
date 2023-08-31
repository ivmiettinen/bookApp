import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Alert } from '@mui/material';
import { uiActions } from '../../store/ui-slice';

const Notification = (props) => {
    const [visible, setVisible] = useState(true);

    const dispatch = useDispatch();

    useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(dispatch(uiActions.resetNotification()));
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [props.timeout, dispatch]);

    let notiClasses = '';

    if (props.status === 'success') {
        notiClasses = 'success';
    }

    if (props.status === 'error') {
        notiClasses = 'error';
    }


    if (!visible) {
        return null;
    }

    return <div className={notiClasses}>
        <Alert variant="filled" severity={notiClasses}>
            {props.message}
        </Alert></div>;
};

export default Notification;
