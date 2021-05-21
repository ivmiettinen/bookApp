import React from 'react'
import { NavLink } from 'react-router-dom'
import classes from './MainHeader.module.css'
// import bookImage from '../../pexels-negative-space-34592.jpg'
import bookImage from './Pics/pexels-negative-space-34592.jpg'

const MainHeader = () => {
    return (
        <header className={classes.header}>
            <ul>
                <li>
                    <NavLink activeClassName={classes.active} to='/auth'>
                        Auth
                    </NavLink>
                </li>
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

// style={{backgroundImage: `url(${bookImage})`}}
