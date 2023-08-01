import React from 'react';
// import classes from './Book.module.css';
import PropTypes from 'prop-types';
import BookList from './BookList';
import { useSelector } from 'react-redux';

const Book = ({ addNewLike, deleteBook, Togglable }) => {
    const books = useSelector((state) => state.books);
    console.log('books', books);
    return (
        <div>
            {books.map((book) => (
                <BookList
                    key={book.id}
                    id={book.id}
                    book={book}
                    title={book.title}
                    author={book.author}
                    url={book.url}
                    likes={book.likes}
                    addNewLike={addNewLike}
                    deleteBook={deleteBook}
                    Togglable={Togglable}
                />
            ))}
        </div>
    );
};

Book.propTypes = {
    addNewLike: PropTypes.func.isRequired,
    deleteBook: PropTypes.func.isRequired,
    Togglable: PropTypes.object.isRequired,
};

export default Book;
