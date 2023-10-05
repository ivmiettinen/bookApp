import axios from 'axios';

// const userUrl = 'http://localhost:3003/api/users';
const userUrl = 'http://localhost:8888/.netlify/functions/users';

const signUp = async (newObject) => {
    const response = await axios.post(userUrl, newObject);
    return response.data;
};

export default signUp;
