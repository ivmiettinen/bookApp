import React from 'react'
import classes from './BookComments.module.css'
import Rating from './Rating'
import Togglable from '../Togglable'

const BookComments = ({ comments }) => {
    // console.log('commenttt', comments)

    // console.log(
    //     'milta nayttaa propsit',
    //     comments.map((p) => p)
    // )

    // console.log('comments length', comments.length)
    // console.log(
    //     'reduce',
    //     comments.reduce((acc, crv) => {
    //         return acc + crv.rating
    //     }, 0)
    // )

    let reducee = comments.reduce((acc, crv) => {
        return acc + crv.rating
    }, 0)

    let combine = Math.round(reducee / comments.length)

    // console.log('combineeee', combine)

    // console.log(
    //     'book reviews',
    //     comments.map((p) => p.comment)
    // )

    return (
        <div className={classes.authButtons}>
            <Togglable
                buttonLabel='View comments'
                className='hideWhenVisible'
            >
                <h3>
                    Overall rating: <Rating overall={combine} />
                </h3>
                <h3>Comments:</h3>
                {comments.map((item) => (
                    // Without the `key`, React will fire a key warning
                    <div key={item._id} className={classes.bookFormStyle}>
                        <strong>{item.name}</strong>
                        <p>{item.createdAt.substring(0, 10)}</p>
                        <p>{item.comment}</p>
                    </div>
                ))}
            </Togglable>
        </div>
    )
}

export default BookComments
// comments.reviews.map((p) => p.comment)
