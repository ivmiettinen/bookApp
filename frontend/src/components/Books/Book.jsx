import React from 'react';
// import classes from './Book.module.css';
import BookList from './BookList';
import { useAppSelector } from '../../store/hooks';
import Togglable from '../../components/UI/Togglable';
import useBookActions from '../../store/useBookActions';


const Book = () => {
    const books = useAppSelector((state) => state.books.items);

    const { deleteBook } = useBookActions();

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
