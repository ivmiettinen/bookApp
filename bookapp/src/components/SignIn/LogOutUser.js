import React from 'react'
import PropTypes from 'prop-types'
import { useHistory } from 'react-router-dom'

const LogOutUser = ({ user, logOut }) => {
    let history = useHistory()

    const handleLogout = () => {
        logOut()
        history.push('/login')
    }

    return (
        <>
            {user !== null ? (
                <>
                    User <strong>{user.name}</strong> is currently logged in.
                    <button onClick={handleLogout}>Log out</button>
                </>
            ) : (
                <></>
            )}
        </>
    )
}

LogOutUser.propTypes = {
    user: PropTypes.object,
    logOut: PropTypes.func.isRequired,
}

export default LogOutUser
