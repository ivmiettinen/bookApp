import axios from 'axios';
import type { AuthResponse, LoginInput } from '../types/api';
import { getApiUrl } from './apiConfig';
import { apiRequest } from './apiError';
import { parseAuth } from './apiValidation';

const login = (credentials: LoginInput): Promise<AuthResponse> => apiRequest(async () => {
    const response = await axios.post<unknown>(getApiUrl('login'), credentials);
    return parseAuth(response.data);
});

export default login;
