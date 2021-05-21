import React, { useState } from 'react'
import PropTypes from 'prop-types'

const LoginForm = ({ handleLogin, showSignUp }) => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSignIn = (e) => {
        e.preventDefault()

        handleLogin({
            name: name,
            username: username,
            password: password,
        })

        setName('')
        setUsername('')
        setPassword('')
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
    showSignUp: PropTypes.bool.isRequired
}

export default LoginForm
