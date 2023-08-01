import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import Card from '../UI/Card';
import classes from './LogOutUser.module.css';
import Button from '../UI/Button';

const LogOutUser = ({ user, logOut }) => {
    const history = useHistory();

    const handleLogout = () => {
        logOut();
        history.push('/auth');
    };

    return (
        <>
            {user !== null ? (
                <Card>
                    <div className={classes.LogOutUser}>
                        User {user.username} is currently logged in.
                    </div>
                    <div className={classes.logOutButton}>
                        <Button onClick={handleLogout}>Log out</Button>
                    </div>
                </Card>
            ) : (
                <></>
            )}
        </>
    );
};

LogOutUser.propTypes = {
    user: PropTypes.object,
    logOut: PropTypes.func.isRequired,
};

export default LogOutUser;
