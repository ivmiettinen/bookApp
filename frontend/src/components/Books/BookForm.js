import React, { useState } from 'react';
import classes from './BookForm.module.css';
import PropTypes from 'prop-types';
import Button from '../UI/Button';

const BookForm = ({ addBook }) => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [url, setUrl] = useState('');

    const createBook = (e) => {
        e.preventDefault();

        const newBook = {
            title,
            author,
            url
        };

        addBook(newBook);

        setTitle('');
        setAuthor('');
        setUrl('');
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
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
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
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                    />
                </p>
                <p>
                    <label>url:</label>
                    <br />
                    <input name="url"
                        type="url"
                        id="url"
                        maxLength="60"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)} required />

                    <br />
                </p>
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
