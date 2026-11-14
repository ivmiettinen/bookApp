import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch } from '../../store/hooks';
import classes from './AuthForm.module.css';
import validator from 'validator';
import Card from '../UI/Card';
import Button from '../UI/Button';
import { handleAuth } from '../../services/authService';
import { uiActions } from '../../store/ui-slice';
import { useHistory } from 'react-router-dom';

interface AuthFormProps {
    mode: 'login' | 'signup';
}

const AuthForm = ({ mode }: AuthFormProps) => {
    const showSignUp = mode === 'signup';
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const history = useHistory();

    const handleAuthFormReset = () => {
        setUsername('');
        setEmail('');
        setPassword('');
    };

    const dispatch = useAppDispatch();

    const handleSignIn = (e: FormEvent<HTMLFormElement>) => {
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
            dispatch(handleAuth({
                email: email,
                username: username,
                password: password,
            }, showSignUp, history));

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
                                maxLength={40}
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
                            maxLength={14}
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
                            maxLength={50}
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

export default AuthForm;
