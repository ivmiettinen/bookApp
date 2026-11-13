import axios from 'axios';

let signUpUrl = import.meta.env.VITE_USER_URL || import.meta.env.REACT_APP_userUrl;

if (import.meta.env.DEV) {
    signUpUrl = import.meta.env.VITE_USER_URL_DEV || import.meta.env.REACT_APP_userUrl_dev;
} 

const signUp = async (newObject) => {
    const response = await axios.post(signUpUrl, newObject);
    return response.data;
};

export default signUp;
