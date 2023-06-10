import axios from 'axios'

const userUrl = 'http://localhost:3003/api/users'
// const userUrl = 'https://hidden-plateau-70218.herokuapp.com/api/users'

const signUp = async (newObject) => {
    const response = await axios.post(userUrl, newObject)
    return response.data
}

export default { signUp }
