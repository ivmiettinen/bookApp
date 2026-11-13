import React from 'react';
// import classes from './Book.module.css';
import BookList from './BookList';
import { useSelector } from 'react-redux';
import Togglable from '../../components/UI/Togglable';
import BookActions from '../../store/BookActions';


const Book = () => {
    const books = useSelector((state) => state.books);

    const { deleteBook } = BookActions();

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

export default Book;
