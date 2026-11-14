import { useHistory } from 'react-router-dom';
import Card from '../UI/Card';
import classes from './LogOutUser.module.css';
import Button from '../UI/Button';
import { handleLogOut } from '../../services/authService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';


const LogOutUser = () => {
    const username = useAppSelector((state) => state.user.user);
    const history = useHistory();

    const dispatch = useAppDispatch();

    const userLogout = () => {
        dispatch(handleLogOut(history));
    };

    return (
        <>
            {username !== null ? (
                <Card>
                    <div className={classes.LogOutUser}>
                        User {username} is currently logged in.
                    </div>
                    <div className={classes.logOutButton}>
                        <Button onClick={userLogout}>Log out</Button>
                    </div>
                </Card>
            ) : (
                <></>
            )}
        </>
    );
};

export default LogOutUser;
