import React from 'react'
import classes from './BookHeader.module.css'

const BookHeader = () => {
    return (
        <div className={classes.BookHeaderStyle}>
            This page contains books added by authenticated  users. 
        </div>
    )
}

export default BookHeader
