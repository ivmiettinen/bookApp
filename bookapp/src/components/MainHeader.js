import React from 'react'
import { NavLink } from 'react-router-dom'
import classes from './MainHeader.module.css'

const MainHeader = () => {
    return (
        <header className={classes.header}>
            <ul>
                <li>
                    <NavLink activeClassName={classes.active} to='/login'>Login</NavLink>
                </li>
                <li>
                    <NavLink activeClassName={classes.active} to='/books'>Books</NavLink>
                </li>
                <li>
                    <NavLink activeClassName={classes.active} to='/about'>About</NavLink>
                </li>
            </ul>
        </header>
    )
}

export default MainHeader
