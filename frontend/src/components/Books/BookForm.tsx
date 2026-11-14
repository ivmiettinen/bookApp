import { useState } from 'react';
import type { FormEvent } from 'react';
import { isHttpUrl } from './bookUrl';
import classes from './BookForm.module.css';
import Button from '../UI/Button';
import useBookActions from '../../store/useBookActions';
import Togglable from '../../components/UI/Togglable';

const BookForm = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [url, setUrl] = useState('');

    const { addBook, bookFormRef, isAdding } = useBookActions();

    const bookRef = bookFormRef;

    const createBook = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newBook = {
            title,
            author,
            url
        };

        if (isAdding || !isHttpUrl(url)) return;
        if (!await addBook(newBook)) return;

        setTitle('');
        setAuthor('');
        setUrl('');
    };

    return (
        <Togglable
            buttonLabel="Add a book"
            ref={bookRef}
            disabled={isAdding}
            className="hideWhenVisible"
        >
            <div className={classes.bookFormStyle}>
                <h2>Create a new book</h2>

                <form onSubmit={createBook} aria-busy={isAdding}>
                    <p>
                        <label htmlFor="title">title:</label>
                        <br />
                        <input
                            name="title"
                            type="text"
                            id="title"
                            maxLength={100}
                            value={title}
                            disabled={isAdding}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </p>

                    <p>
                        <label htmlFor="author">author:</label>
                        <br />
                        <input
                            name="author"
                            type="text"
                            id="author"
                            maxLength={80}
                            value={author}
                            disabled={isAdding}
                            onChange={(e) => setAuthor(e.target.value)}
                            required
                        />
                    </p>
                    <p>
                        <label htmlFor="url">url:</label>
                        <br />
                        <input name="url"
                            type="url"
                            id="url"
                            maxLength={160}
                            value={url}
                            disabled={isAdding}
                            onChange={(e) => {
                                const input = e.currentTarget;
                                setUrl(input.value);
                                input.setCustomValidity(input.value && !isHttpUrl(input.value)
                                    ? 'Use an HTTP or HTTPS URL.' : '');
                            }} required />

                        <br />
                    </p>
                    <Button className={classes.bookFormButton} type="submit" disabled={isAdding}>
                        create
                    </Button>
                </form>
            </div>
        </Togglable>
    );
};

export default BookForm;
