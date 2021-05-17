import React from 'react'
import { useHistory } from 'react-router-dom'

const LoggedInUser = ({ user, logOut }) => {
    let history = useHistory()

    const handleLogout = () => {
        logOut()
        history.push('/login')
    }

    return (
        <>
            {user !== null ? (
                <>
                    <p>
                        <strong>{user.name}</strong> is logged in.
                        <button onClick={handleLogout}>Log out</button>
                    </p>
                </>
            ) : (
                <></>
            )}
        </>
    )
}

export default LoggedInUser
