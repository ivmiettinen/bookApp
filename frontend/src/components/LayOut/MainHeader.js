import React from 'react'
import { NavLink } from 'react-router-dom'
import classes from './MainHeader.module.css'

import picture from './headerImg.jpg'

//For deployment purpose:
const headerImg = {
    width: '100%',
    backgroundColor: '#5f81ad',
    padding: '5.2rem 0rem',
    borderRadius: '12px',
    backgroundImage: `url(${picture})`,
    height: '100%',
    opacity: '80%',
}

const MainHeader = ({ user }) => {
    return (
        <header className={classes.header} style={headerImg}>
            <ul>
                {user === null && (
                    <li>
                        <NavLink activeClassName={classes.active} to='/auth'>
                            Auth
                        </NavLink>
                    </li>
                )}
                {user !== null && (
                    <li>
                        <NavLink activeClassName={classes.active} to='/logout'>
                            Logout
                        </NavLink>
                    </li>
                )}
                <li>
                    <NavLink activeClassName={classes.active} to='/books'>
                        Books
                    </NavLink>
                </li>
                <li>
                    <NavLink activeClassName={classes.active} to='/about'>
                        About
                    </NavLink>
                </li>
            </ul>
        </header>
    )
}



export default MainHeader
