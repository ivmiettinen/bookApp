import { ApiError } from './apiError';

const keys = {
    books: ['VITE_BOOKS_URL', 'REACT_APP_books_Url', 'VITE_BOOKS_URL_DEV', 'REACT_APP_books_Url_dev'],
    login: ['VITE_LOGIN_URL', 'REACT_APP_loginUrl', 'VITE_LOGIN_URL_DEV', 'REACT_APP_loginUrl_dev'],
    signUp: ['VITE_USER_URL', 'REACT_APP_userUrl', 'VITE_USER_URL_DEV', 'REACT_APP_userUrl_dev'],
} as const;

export function getApiUrl(service: keyof typeof keys): string {
    const [primary, legacy, devPrimary, devLegacy] = keys[service];
    const env = import.meta.env;
    const value = env.DEV ? env[devPrimary] || env[devLegacy] : env[primary] || env[legacy];
    // Support same-origin paths and absolute HTTP(S) addresses; never report values.
    if (typeof value !== 'string' || !value.trim()) {
        throw new ApiError('configuration', `Missing API configuration: ${service}`);
    }
    const url = value.trim();
    try {
        if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) {
            if (url.includes('?') || url.includes('#') || url === '/') throw new Error();
            return url.replace(/\/+$/, '');
        }
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new Error();
        if (parsed.search || parsed.hash) throw new Error();
        return url.replace(/\/+$/, '');
    } catch {
        throw new ApiError('configuration', `Invalid API configuration: ${service}`);
    }
}
