import { useAppSelector } from '../../store/hooks';
import { NavLink } from 'react-router-dom';
import classes from './MainHeader.module.css';

const MainHeader = () => {

    const username = useAppSelector((state) => state.user.user);
    return (
        <header className={classes.header} >
            <ul>

                {username === null ? (
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
