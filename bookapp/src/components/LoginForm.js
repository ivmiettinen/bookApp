import React from 'react'
import PropTypes from 'prop-types'

const LoginForm = ({
    user,
    handleLogin,
    username,
    password,
    setUsername,
    setPassword,
}) => {
    console.log('userrrr', user)
    console.log('typeof', typeof user)

    return (
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
                <button type='submit'>login</button>
            </div>
        </form>
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
