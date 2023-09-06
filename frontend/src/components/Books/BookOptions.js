import React from 'react';
import classes from './SortBooks.module.css';
import {
    sortBooks,
} from '../../store/book-slice';
import { useDispatch } from 'react-redux';

const BookOptions = () => {

    const dispatch = useDispatch();

    const sortArray = (type) => {
        dispatch(sortBooks(type));
    };

    return (
        <div className={classes.SortBooksStyle}>
            <select defaultValue="" onChange={(e) => sortArray(e.target.value)}>
                <option value="" disabled>
                    Sort by:
                </option>
                <option value="author">Author</option>
                <option value="title">Book name</option>
                <option value="likes">Likes</option>
            </select>
        </div>
    );
};

export default BookOptions;
