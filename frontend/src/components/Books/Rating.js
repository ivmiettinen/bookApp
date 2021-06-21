import React, { useState } from 'react'
import Rating from '@material-ui/lab/Rating'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '1rem',
        '& > * + *': {
            marginTop: theme.spacing(1),
        },
    },
}))

const HalfRating = (props) => {
    // console.log('HalfRating props', props)

    const classes = useStyles()

    const [value, setValue] = useState(0 || props.overall)

    return (
        <li className={classes.root}>
            <Rating
                name='size-small'
                precision={0.5}
                defaultValue={value || 0}
                size='small'
                onChange={(event, newValue) => {
                    setValue(newValue)
                }}
                readOnly
            />
        </li>
    )
}

export default HalfRating
