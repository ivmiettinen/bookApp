import { useState, useEffect } from 'react';
import { useAppDispatch } from '../../store/hooks';
import { Alert } from '@mui/material';
import { uiActions } from '../../store/ui-slice';
import type { NotificationStatus } from '../../store/ui-slice';

interface NotificationProps {
    status: NotificationStatus;
    message: string;
    timeout?: number;
}

const Notification = (props: NotificationProps) => {
    const [visible, setVisible] = useState(true);

    const dispatch = useAppDispatch();

    useEffect(() => {
        const timeout = setTimeout(() => {
            dispatch(dispatch(uiActions.resetNotification()));
            setVisible(false);
        }, 5000);

        return () => clearTimeout(timeout);
    }, [props.timeout, dispatch]);

    const notiClasses = props.status;


    if (!visible) {
        return null;
    }

    return <div className={notiClasses}>
        <Alert variant="filled" severity={notiClasses}>
            {props.message}
        </Alert></div>;
};

export default Notification;
