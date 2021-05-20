import React from 'react'
import PropTypes from 'prop-types'

const LoginForm = ({
    name,
    setName,
    handleLogin,
    username,
    password,
    setUsername,
    setPassword,
    showSignUp,
}) => {
    // console.log('user', user)
    // console.log('typeof user', typeof user)

    return (
        <>
            <form onSubmit={handleLogin}>
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
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    setUsername: PropTypes.func.isRequired,
    setPassword: PropTypes.func.isRequired,
}

export default LoginForm
