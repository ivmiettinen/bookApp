import BookList from './BookList';
import { useAppSelector } from '../../store/hooks';
import useBookActions from '../../store/useBookActions';


const Book = () => {
    const books = useAppSelector((state) => state.books.items);

    const { deleteBook } = useBookActions();

    return (
        <div>
            {books.map((book) => (
                <BookList
                    key={book.id}
                    book={book}
                    deleteBook={deleteBook}
                />
            ))}
        </div>
    );
};

export default Book;
