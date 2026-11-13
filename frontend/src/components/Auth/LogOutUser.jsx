import React from 'react';
import { useHistory } from 'react-router-dom';
import Card from '../UI/Card';
import classes from './LogOutUser.module.css';
import Button from '../UI/Button';
import { handleLogOut } from '../../services/authService';
import { useAppDispatch } from '../../store/hooks';


const LogOutUser = ({ user }) => {
    const history = useHistory();

    const dispatch = useAppDispatch();

    const userLogout = () => {
        dispatch(handleLogOut(history));
    };

    return (
        <>
            {user !== null ? (
                <Card>
                    <div className={classes.LogOutUser}>
                        User {user.user} is currently logged in.
                    </div>
                    <div className={classes.logOutButton}>
                        <Button onClick={userLogout}>Log out</Button>
                    </div>
                </Card>
            ) : (
                <></>
            )}
        </>
    );
};

export default LogOutUser;