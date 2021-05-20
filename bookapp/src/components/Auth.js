import React from 'react'
import {
    BrowserRouter as Router,
    useHistory
} from 'react-router-dom'

const Auth = ({

    setShowSignIn,
    setShowLogIn
}) => {

    let history = useHistory()

    const signUpBtnHandler = () => {
        setShowSignIn((prevstate) => !prevstate)
        history.push('/login')
    }

    const loginBtnHandler = () => {
        setShowLogIn((prevstate) => !prevstate)
        history.push('/login')
    }


    return (
        <>
            <p>AAAAAAAAAA</p>
            <button onClick={signUpBtnHandler}>Sign up</button>

            <button onClick={loginBtnHandler}>Login</button>
        </>
    )
}

export default Auth
