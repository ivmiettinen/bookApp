import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import classes from './MainHeader.module.css';

const MainHeader = () => {

    const user = useSelector((state) => state.user);
    return (
        <header className={classes.header} >
            <ul>

                {!user.user ? (
                    <li>
                        <NavLink activeClassName={classes.active} to='/auth'>
                            Auth
                        </NavLink>
                    </li>
                ) : (
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
    );
};



export default MainHeader;
