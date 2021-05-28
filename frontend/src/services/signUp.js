import axios from 'axios'

const userUrl = 'http://bookappserver-env.eba-sf8pixz2.us-east-2.elasticbeanstalk.com/api/users'

const signUp = async (newObject) => {
    const response = await axios.post(userUrl, newObject)
    return response.data
}

export default { signUp }
