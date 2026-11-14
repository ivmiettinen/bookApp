
import React, { useState } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {
    addLike,
} from '../../store/book-slice';
import bookService from '../.././services/books';
import { uiActions } from '../../store/ui-slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { handleSessionError } from '../../services/session';
import { bookErrorMessage } from '../../services/bookErrors';



const LikeButton = ({ booksId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const dispatch = useAppDispatch();
    const books = useAppSelector((state) => state.books.items);

    const handleLike = async (book) => {

        const bookId = books.find((b) => b.id === book);

        const id = bookId.id;

        const changeBookLikes = { ...bookId, likes: bookId.likes + 1 };

        try {
            const updateBook = await bookService.update(id, changeBookLikes);
            dispatch(addLike(updateBook));

            if (updateBook) {
                setIsLiked(!isLiked);
                setLikes(isLiked ? likes - 1 : likes + 1);
            }

        } catch (exception) {
            if (!dispatch(handleSessionError(exception, 'You must log in before you can like books'))) {
                dispatch(uiActions.showNotification({
                    status: 'error',
                    message: bookErrorMessage(exception, 'like'),
                }));
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }

    };

    return (
        <div>
            <p>likes: {likes}</p>
            <button onClick={() => handleLike(booksId)}>
                {isLiked ? <ThumbDownIcon/> : <ThumbUpIcon/>}
            </button>
        </div>
    );
};

export default LikeButton;
