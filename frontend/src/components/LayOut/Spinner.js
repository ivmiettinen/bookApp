import React from 'react'
import classes from './Spinner.module.css'
import ClipLoader from 'react-spinners/ClipLoader'

const Spinner = ({ loading }) => {
    return (
        <div className={classes.loaderStyle}>
            <p>
                <ClipLoader color='#0e67db' loading={loading} size={150} />
            </p>
            <p>Just a sec - Waking up Heroku backend and fetching data... </p>
        </div>
    )
}

export default Spinner
