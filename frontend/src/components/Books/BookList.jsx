import React from 'react';
import classes from './Book.module.css';
import Togglable from '../../components/UI/Togglable';
import LikeButton from './LikeButton';


const BookList = ({
    author,
    deleteBook,
    id,
    likes,
    title,
    url
}) => {
    return (
        <div className={classes.bookStyle} key={id} id={id}>
            <div >
                <p>
                    <span className={classes.bookTitle}>{title}</span> by{' '}
                    {author}
                </p>
                <Togglable buttonLabel="view">
                    <p>
                        url:{' '}
                        <a href={url} target="_blank" rel="noopener noreferrer">
                            {url}
                        </a>
                    </p>
                    <LikeButton booksId={id} initialLikes={likes} />
                    <p>
                        <button
                            type="deleteBook"
                            value={id}
                            name="deleteBook"
                            onClick={() => deleteBook(id)}
                        >
                            delete
                        </button>
                    </p>
                </Togglable>
            </div>
        </div>
    );
};

export default BookList;
