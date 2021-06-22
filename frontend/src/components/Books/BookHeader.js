import  React  from 'react'
import classes from './BookHeader.module.css'

const BookHeader = () => {
    return (
        <div className={classes.BookHeaderStyle}>
            This page contains books added by users. The books are sorted by
            likes, the book with the most likes is at the top.
        </div>
    )
}

export default BookHeader
