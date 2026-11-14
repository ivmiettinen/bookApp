import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Alert } from '@mui/material';
import { uiActions } from '../../store/ui-slice';

const NOTIFICATION_DURATION_MS = 5000;

const Notification = () => {
    const notification = useAppSelector((state) => state.ui.notification);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!notification) return;

        const timeout = setTimeout(() => {
            dispatch(uiActions.resetNotification());
        }, NOTIFICATION_DURATION_MS);

        return () => clearTimeout(timeout);
    }, [notification, dispatch]);

    if (!notification) {
        return null;
    }

    return <div className={notification.status}>
        <Alert variant="filled" severity={notification.status}>
            {notification.message}
        </Alert></div>;
};

export default Notification;
