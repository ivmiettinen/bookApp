import React from 'react'
import classes from './SortBooks.module.css'

const SortBooks = () => {
    return (
        <div className={classes.SortBooksStyle}>
            <select name='sort'>
                <option selected disabled>
                    Sort by:
                </option>
                <option value='albums'>Author</option>
                <option value='members'>Book name</option>
                <option value='formed'>Likes</option>
            </select>
        </div>
    )
}

export default SortBooks
