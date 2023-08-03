import React from 'react';
import classes from './Book.module.css';
import Togglable from '../../components/UI/Togglable';

const BookList = ({
    author,
    addNewLike,
    deleteBook,
    id,
    likes,
    title,
    url,
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
                    <p>likes: {likes} </p>

                    <p>
                        <button
                            type="newLike"
                            value={title}
                            name="newLike"
                            onClick={() => addNewLike(id)}
                        >
                            like
                        </button>
                    </p>
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
