import React from 'react'
import PropTypes from 'prop-types'
import classes from './SortBooks.module.css'

const SortBooks = ({ sortArray }) => {
    return (
        <div className={classes.SortBooksStyle}>
            <select
                defaultValue=''
                onChange={(e) => sortArray(e.target.value)}
            >
                <option value='' disabled>
                    Sort by:
                </option>
                <option value='author'>Author</option>
                <option value='title'>Book name</option>
                <option value='likes'>Likes</option>
            </select>
        </div>
    )
}

SortBooks.propTypes = {
    sortArray: PropTypes.func.isRequired,
}

export default SortBooks
