import React from 'react';
import classes from './BookForm.module.css';
import PropTypes from 'prop-types';
import Button from '../UI/Button';

const BookForm = ({ addBook }) => {
    const createBook = (e) => {
        e.preventDefault();

        addBook({
            title: e.target.title.value,
            author: e.target.author.value,
            url: e.target.url.value
        });
    };

    return (
        <div className={classes.bookFormStyle}>
            <h2>Create a new book</h2>

            <form onSubmit={createBook}>
                <p>
                    <label>title:</label>
                    <br />
                    <input
                        name="title"
                        type="text"
                        id="title"
                        maxLength="30"
                        required
                    />
                </p>

                <p>
                    <label>author:</label>
                    <br />
                    <input
                        name="author"
                        type="text"
                        id="author"
                        maxLength="20"
                        required
                    />
                </p>

                <label>url:</label>
                <br />
                <input name="url" type="url" id="url" maxLength="60" required />
                <br />

                <Button className={classes.bookFormButton} type="submit">
                    create
                </Button>
            </form>
        </div>
    );
};

BookForm.propTypes = {
    addBook: PropTypes.func.isRequired,
};

export default BookForm;
