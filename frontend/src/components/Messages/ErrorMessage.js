import { Alert } from '@mui/material';
import React from 'react';

const ErrorMessage = ({ errorMessage }) => {
    if (errorMessage === null) {
        return null;
    }
    return (
        <div className='error'>
            <Alert variant='filled' severity='error'>
                {errorMessage}
            </Alert>
        </div>
    );
};

export default ErrorMessage;
