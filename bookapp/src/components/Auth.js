import React from 'react'
import { BrowserRouter as Router, useHistory } from 'react-router-dom'

const Auth = ({ setShowSignUp, setShowLogIn }) => {
    let history = useHistory()

    const signUpBtnHandler = () => {
        console.log('GRAUH!')
        setShowSignUp(true)
        setShowLogIn(false)
        history.push('/login')
    }

    const loginBtnHandler = () => {
        setShowLogIn(true)
        setShowSignUp(false)
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
