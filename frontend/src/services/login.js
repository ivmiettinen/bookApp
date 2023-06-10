import axios from 'axios'
const baseUrl = 'http://localhost:3003/api/login'
// const baseUrl = 'https://hidden-plateau-70218.herokuapp.com/api/login'

const login = async (credentials) => {
    const response = await axios.post(baseUrl, credentials)
    return response.data
}

export default { login }
