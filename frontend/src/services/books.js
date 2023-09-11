import axios from 'axios';

const booksUrl = 'http://localhost:3003/api/books';
// const baseUrl = 'https://hidden-plateau-70218.herokuapp.com/api/books'

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

export default { getAll, create, remove, update, setToken };
