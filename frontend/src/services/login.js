import axios from 'axios';

let loginUrl = import.meta.env.VITE_LOGIN_URL || import.meta.env.REACT_APP_loginUrl;

if (import.meta.env.DEV) {
    loginUrl = import.meta.env.VITE_LOGIN_URL_DEV || import.meta.env.REACT_APP_loginUrl_dev;
} 

const login = async (credentials) => {
    const response = await axios.post(loginUrl, credentials);
    return response.data;
};

export default login;