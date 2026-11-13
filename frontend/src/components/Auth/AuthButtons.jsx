import React from 'react';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import classes from './AuthButtons.module.css';
import Button from '../UI/Button';
import Card from '../UI/Card';

const AuthButtons = ({ setShowSignUp, setShowLogIn }) => {
    const history = useHistory();

    const signUpBtnHandler = () => {
        setShowSignUp(true);
        setShowLogIn(false);
        history.push('/signup');
    };

    const loginBtnHandler = () => {
        setShowLogIn(true);
        setShowSignUp(false);
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

AuthButtons.propTypes = {
    setShowSignUp: PropTypes.func.isRequired,
    setShowLogIn: PropTypes.func.isRequired,
};

export default AuthButtons;
