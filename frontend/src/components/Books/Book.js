import React from 'react';
// import classes from './Book.module.css';
import PropTypes from 'prop-types';
import BookList from './BookList';
import { useSelector } from 'react-redux';

const Book = ({ deleteBook, Togglable }) => {
    const books = useSelector((state) => state.books);

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
                    deleteBook={deleteBook}
                    Togglable={Togglable}
                    likesbyId={book.likesbyId}
                />
            ))}
        </div>
    );
};

Book.propTypes = {
    // addNewLike: PropTypes.func.isRequired,
    deleteBook: PropTypes.func.isRequired,
    Togglable: PropTypes.object.isRequired,
};

export default Book;
