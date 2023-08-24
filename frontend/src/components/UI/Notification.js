import React, { useState, useEffect } from 'react';
import { Alert } from '@material-ui/lab';

const Notification = (props) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setVisible(false);
        },  5000);

        return () => clearTimeout(timeout);
    }, [props.timeout]);

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
            <p>{props.message}</p>
        </Alert></div>;
};

export default Notification;
