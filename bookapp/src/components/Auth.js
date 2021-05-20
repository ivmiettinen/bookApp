import React from 'react'
import { BrowserRouter as Router, useHistory } from 'react-router-dom'
import classes from './Auth.module.css'
import Button from './UI/Button'
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
            <Button onClick={signUpBtnHandler}>Sign up</Button>

            <Button onClick={loginBtnHandler}>Login</Button>
        </Card>
    )
}

export default Auth
