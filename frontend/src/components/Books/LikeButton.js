
import React, { useState } from 'react';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import {
    addLike,
} from '../../store/book-slice';
import bookService from '../.././services/books';
import { useDispatch, useSelector } from 'react-redux';



const LikeButton = ({ booksId, initialLikes }) => {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);

    const dispatch = useDispatch();
    const books = useSelector((state) => state.books);

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
            console.log('error on put:', exception);
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