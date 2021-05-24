import React, { useState } from 'react'
import PropTypes from 'prop-types'

const LoginForm = ({ handleLogin, showSignUp, setErrorMessage }) => {
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')

    const handleSignIn = (e) => {
        e.preventDefault()

        console.log('name.trim().length', name.trim().length)

        if (showSignUp && username.trim().length < 3) {
            setErrorMessage('Username must be at least 3 characters long.')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
            return
        } else if (showSignUp && name.trim().length < 3) {
            console.log('arg')
            setErrorMessage('Name must be at least 3 characters long.')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
            return
        } else if (showSignUp && password.trim().length < 1) {
            setErrorMessage('password must be 3 letters or longer.')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
            return
        } else {
            handleLogin({
                name: name,
                username: username,
                password: password,
            })
            setName('')
            setUsername('')
            setPassword('')
        }
    }

    return (
        <>
            <form onSubmit={handleSignIn}>
                <label>
                    <p> username:</p>
                    <input
                        type='text'
                        value={username}
                        name='Username'
                        onChange={({ target }) => setUsername(target.value)}
                    />
                </label>
                {showSignUp ? (
                    <label>
                        <p>name:</p>
                        <input
                            type='text'
                            value={name}
                            name='name'
                            onChange={({ target }) => setName(target.value)}
                        />
                    </label>
                ) : (
                    <></>
                )}
                <label>
                    <p>password:</p>
                    <input
                        type='password'
                        value={password}
                        name='Password'
                        onChange={({ target }) => setPassword(target.value)}
                    />
                </label>
                <div>
                    <button type='submit'>
                        {showSignUp ? 'Sign up' : 'login'}
                    </button>
                </div>
            </form>
        </>
    )
}

LoginForm.propTypes = {
    handleLogin: PropTypes.func.isRequired,
    showSignUp: PropTypes.bool.isRequired,
}

export default LoginForm
