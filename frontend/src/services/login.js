import axios from 'axios'
const baseUrl = 'http://bookappserver-env.eba-sf8pixz2.us-east-2.elasticbeanstalk.com/api/login'

const login = async (credentials) => {
    const response = await axios.post(baseUrl, credentials)
    return response.data
}

export default { login }
