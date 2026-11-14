import type { Book } from '../../types/api';
import { isHttpUrl } from './bookUrl';
import classes from './Book.module.css';
import Togglable from '../../components/UI/Togglable';
import LikeButton from './LikeButton';


interface BookListProps {
    book: Book;
    deleteBook: (id: Book['id']) => Promise<void>;
}

const BookList = ({ book, deleteBook }: BookListProps) => {
    const { id, title, author, url, likes } = book;
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
                        {isHttpUrl(url) ? (
                            <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                        ) : <span>{url}</span>}
                    </p>
                    <LikeButton booksId={id} initialLikes={likes} />
                    <p>
                        <button
                            type="button"
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
