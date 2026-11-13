import React from 'react';
import classes from './SortBooks.module.css';
import {
    sortBooks,
    isSortKey,
} from '../../store/book-slice';
import { useAppDispatch } from '../../store/hooks';

const BookOptions = () => {

    const dispatch = useAppDispatch();

    const sortArray = (type) => {
        if (isSortKey(type)) dispatch(sortBooks(type));
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
