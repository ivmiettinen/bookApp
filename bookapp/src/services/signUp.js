import axios from 'axios'

const userUrl = 'http://localhost:3003/api/users'

const signUp = async (newObject) => {
    const response = axios.post(userUrl, newObject)
    return response.data
}

export default { signUp }
