import { Alert } from '@mui/material';
import React from 'react';

const SuccessMessage = ({ successMessage }) => {
    if (successMessage === null) {
        return null;
    }

    return <div className='success'>
        <Alert variant="filled" severity="success">{successMessage}</Alert></div>;
};

export default SuccessMessage;