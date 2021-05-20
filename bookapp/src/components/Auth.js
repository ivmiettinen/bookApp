import React from 'react'
import { BrowserRouter as Router, useHistory } from 'react-router-dom'
import classes from './Auth.module.css'
import Card from './UI/Card'

const Auth = ({ setShowSignUp, setShowLogIn }) => {
    let history = useHistory()

    const signUpBtnHandler = () => {
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
        <Card className={classes.authButtons}>
            <button onClick={signUpBtnHandler}>Sign up</button>

            <button onClick={loginBtnHandler}>Login</button>
        </Card>
    )
}

export default Auth
