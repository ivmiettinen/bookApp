import React, { useState } from 'react'
import classes from './LoginForm.module.css'
import PropTypes from 'prop-types'
import validator from 'validator'
import Card from '../UI/Card'
import Button from '../UI/Button'

const LoginForm = ({ handleLogin, showSignUp, setErrorMessage }) => {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleSignIn = (e) => {
        e.preventDefault()

        if (showSignUp && username.trim().length < 3) {
            setErrorMessage('Username must be at least 3 characters long.')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
            return
        } else if (showSignUp && email.trim().length < 3) {
            setErrorMessage('Email must be at least 3 characters long.')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
            return
        } else if (
            showSignUp &&
            !validator.isStrongPassword(password, {
                minLength: 8,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1,
            })
        ) {
            setErrorMessage('Password must be 8 letters long and have AT LEAST: 1 lowercase, 1 uppercase, 1 number and 1 symbol.')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
            return
        } else {
            handleLogin({
                email: email,
                username: username,
                password: password,
            })
            setEmail('')
            setUsername('')
            setPassword('')
        }
    }

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
                            onChange={({ target }) => setPassword(target.value)}
                        />
                    </label>
                </p>
                <p>
                    <Button type='submit'>
                        {showSignUp ? 'Sign up' : 'login'}
                    </Button>
                </p>
            </form>
        </Card>
    )
}

LoginForm.propTypes = {
    handleLogin: PropTypes.func.isRequired,
    showSignUp: PropTypes.bool.isRequired,
}

export default LoginForm
