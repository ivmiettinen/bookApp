import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAppDispatch } from '../../store/hooks';
import classes from './AuthForm.module.css';
import { formLimits, signUpError } from '../../validation/formLimits';
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

        const input = {
            email: showSignUp ? email.trim() : email,
            username: showSignUp ? username.trim() : username,
            password,
        };
        const error = showSignUp ? signUpError(input) : null;
        if (error) {
            dispatch(uiActions.showNotification({ status: 'error', message: error }));
            return;
        }
        dispatch(handleAuth(input, showSignUp, history));
        handleAuthFormReset();

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
                                maxLength={formLimits.email}
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
                            maxLength={showSignUp ? formLimits.username : undefined}
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
                            aria-describedby={showSignUp ? 'password-limit' : undefined}
                            placeholder='Your password...'
                            onChange={({ target }) => setPassword(target.value)}
                        />
                    </label>
                </p>
                {showSignUp && <p id="password-limit">Up to 72 characters. Letters such as ä and emojis take more space, so fewer may fit.</p>}
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
