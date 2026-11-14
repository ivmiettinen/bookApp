import type { Book } from '../../types/api';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { likeBook } from '../../store/book-slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
interface LikeButtonProps {
    booksId: Book['id'];
}

const LikeButton = ({ booksId }: LikeButtonProps) => {
    const dispatch = useAppDispatch();
    const book = useAppSelector((state) => state.books.items.find((item) => item.id === booksId));
    const pending = useAppSelector((state) => state.books.pendingLikeIds.includes(booksId));

    return (
        <div>
            <p>likes: {book?.likes ?? 0}</p>
            <button type="button" aria-label="Like book" aria-busy={pending}
                disabled={!book || pending} onClick={() => dispatch(likeBook(booksId))}>
                <ThumbUpIcon />
            </button>
        </div>
    );
};

export default LikeButton;
