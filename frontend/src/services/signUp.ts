import axios from 'axios';
import type { AuthResponse, SignUpInput } from '../types/api';
import { getApiUrl } from './apiConfig';
import { apiRequest } from './apiError';
import { parseAuth } from './apiValidation';

const signUp = (input: SignUpInput): Promise<AuthResponse> => apiRequest(async () => {
    const response = await axios.post<unknown>(getApiUrl('signUp'), input);
    return parseAuth(response.data);
});

export default signUp;
