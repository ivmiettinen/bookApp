import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import classes from './AuthForm.module.css';
import PropTypes from 'prop-types';
import validator from 'validator';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { uiActions } from '../../store/ui-slice';

const AuthForm = ({ handleLogin, showSignUp }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleAuthFormReset = () => {
        setUsername('');
        setEmail('');
        setPassword('');
    };

    const dispatch = useDispatch();

    const handleSignIn = (e) => {
        e.preventDefault();

        if (showSignUp && username.trim().length < 3) {
            dispatch(
                uiActions.showNotification({
                    status: 'error',
                    message: 'Username must be at least 3 characters long.',
                }));
            handleAuthFormReset();
            return;
        } else if (showSignUp && email.trim().length < 3) {
            dispatch(
                uiActions.showNotification({
                    status: 'error',
                    message: 'Email must be at least 3 characters long.',
                }));
            handleAuthFormReset();
            return;
        } else if (
            showSignUp && !validator.isStrongPassword(password,
                {
                    minLength: 8,
                    minLowercase: 1,
                    minUppercase: 1,
                    minNumbers: 1,
                    minSymbols: 1,
                })
        ) {
            dispatch(
                uiActions.showNotification({
                    status: 'error',
                    message: 'Password must be 8 letters long and have AT LEAST: 1 lowercase, 1 uppercase, 1 number and 1 symbol.',
                }));
            handleAuthFormReset();
            return;
        } else {
            handleLogin({
                email: email,
                username: username,
                password: password,
            });
            dispatch(
                uiActions.showNotification({
                    status: 'success',
                    message: 'Successful signup',
                }));
            handleAuthFormReset();
        }
    };

    return (
        <Card className={classes.authButtons}>
            <form onSubmit={handleSignIn} className={classes.authForm}>
                {showSignUp ? (
                    <p>
                        <label className={classes.loginLabel}>
                            email:
                            <input
                                className={classes.LoginformInput}
                                type='email'
                                value={email}
                                name='email'
                                placeholder='Your email...'
                                maxLength='40'
                                onChange={({ target }) =>
                                    setEmail(target.value)
                                }
                            />
                        </label>
                    </p>
                ) : (
                    <></>
                )}
                <p>
                    <label className={classes.loginLabel}>
                        username:
                        <input
                            className={classes.LoginformInput}
                            type='text'
                            value={username}
                            name='Username'
                            placeholder='Your name...'
                            maxLength='14'
                            onChange={({ target }) => setUsername(target.value)}
                        />
                    </label>
                </p>

                <p>
                    <label className={classes.loginLabel}>
                        password:
                        <input
                            className={classes.LoginformInput}
                            type='password'
                            value={password}
                            name='Password'
                            placeholder='Your password...'
                            maxLength='50'
                            onChange={({ target }) => setPassword(target.value)}
                        />
                    </label>
                </p>
                <p>
                    <Button type='submit'>
                        {showSignUp ? 'Sign up' : 'Login'}
                    </Button>
                </p>
            </form>
        </Card>
    );
};

AuthForm.propTypes = {
    handleLogin: PropTypes.func.isRequired,
    showSignUp: PropTypes.bool.isRequired,
};

export default AuthForm;
