import React from 'react';
import classes from './Spinner.module.css';
import ClipLoader from 'react-spinners/ClipLoader';

const Spinner = ({ loading }) => {
    return (
        <div className={classes.loaderStyle}>
            <p>
                <ClipLoader color='#0e67db' loading={loading} size={150} />
            </p>
            <p>Just a moment - Fetching data from backend... </p>
        </div>
    );
};

export default Spinner;
