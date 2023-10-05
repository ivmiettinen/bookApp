import axios from 'axios';

let loginUrl = process.env.REACT_APP_loginUrl;

if (process.env.REACT_APP_loginUrl === 'development') {
    loginUrl = process.env.REACT_APP_loginUrl_dev;
} 

const login = async (credentials) => {
    const response = await axios.post(loginUrl, credentials);
    return response.data;
};

export default login;