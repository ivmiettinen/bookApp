import axios from 'axios';

let booksUrl = process.env.REACT_APP_books_Url;

if (process.env.REACT_APP_env === 'development') {
    booksUrl = process.env.REACT_APP_books_Url_dev;
} 

let token = null;

const setToken = (newToken) => {
    token = `bearer ${newToken}`;
};

const getAll = async () => {
    const response = await axios.get(booksUrl);
    return response.data;
};

const create = async (newObject) => {
    const config = {
        headers: { Authorization: token },
    };

    const response = await axios.post(booksUrl, newObject, config);
    return response.data;
};

const remove = async (id) => {
    const config = {
        headers: { Authorization: token },
    };
    const request = await axios.delete(`${booksUrl}/${id}`, config);
    return request.data;
};

const update = async (id, newObject) => {
    const config = {
        headers: { Authorization: token },
    };
    const response = await axios.put(`${booksUrl}/${id}`, newObject, config);
    return response.data;
};

const bookService = { getAll, create, remove, update, setToken };

export default bookService;