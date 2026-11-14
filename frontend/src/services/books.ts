import axios from 'axios';
import type { Book, CreateBookInput, UpdateBookInput } from '../types/api';
import { getApiUrl } from './apiConfig';
import { ApiError, apiRequest } from './apiError';
import { parseBook, parseBooks } from './apiValidation';

let token: string | null = null;

const setToken = (newToken: string | null): void => {
    token = newToken === null ? null : `bearer ${newToken}`;
};

const authorization = () => ({ headers: token === null ? {} : { Authorization: token } });

const getAll = (): Promise<Book[]> => apiRequest(async () => {
    const response = await axios.get<unknown>(getApiUrl('books'));
    return parseBooks(response.data);
});

const create = (input: CreateBookInput): Promise<Book> => apiRequest(async () => {
    const response = await axios.post<unknown>(getApiUrl('books'), input, authorization());
    return parseBook(response.data);
});

const remove = (id: Book['id']): Promise<void> => apiRequest(async () => {
    const response = await axios.delete<unknown>(`${getApiUrl('books')}/${encodeURIComponent(id)}`, authorization());
    if (response.status !== 204) throw new ApiError('invalid-response', 'Expected an empty deletion response (204)');
});

const update = (id: Book['id'], input: UpdateBookInput): Promise<Book> => apiRequest(async () => {
    const response = await axios.put<unknown>(`${getApiUrl('books')}/${encodeURIComponent(id)}`, input, authorization());
    return parseBook(response.data);
});

export default { getAll, create, remove, update, setToken };
