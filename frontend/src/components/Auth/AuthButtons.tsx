import React from 'react';
import { useHistory } from 'react-router-dom';
import classes from './AuthButtons.module.css';
import Button from '../UI/Button';
import Card from '../UI/Card';

const AuthButtons = () => {
    const history = useHistory();

    const signUpBtnHandler = () => {
        history.push('/signup');
    };

    const loginBtnHandler = () => {
        history.push('/login');
    };

    return (
        <React.Fragment>
            <Card className={classes.authButtons}>
                <Button onClick={signUpBtnHandler}>Sign up</Button>

                <Button onClick={loginBtnHandler}>Login</Button>
            </Card>
        </React.Fragment>
    );
};

export default AuthButtons;
