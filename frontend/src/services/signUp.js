import axios from 'axios';

let signUpUrl = process.env.REACT_APP_userUrl;

if (process.env.REACT_APP_env === 'development') {
    signUpUrl = process.env.REACT_APP_userUrl_dev;
} 

const signUp = async (newObject) => {
    const response = await axios.post(signUpUrl, newObject);
    return response.data;
};

export default signUp;
