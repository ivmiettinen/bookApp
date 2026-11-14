import { ApiError } from './apiError';

type BookOperation = 'add' | 'remove' | 'like';

export function bookErrorMessage(error: unknown, operation: BookOperation): string {
    if (error instanceof ApiError) {
        const data = error.response?.data;
        if (operation === 'remove' && error.kind === 'http' && error.response?.status === 400
            && typeof data === 'object' && data !== null && 'error' in data && data.error === 'invalid user') {
            return 'You can only remove books you have added yourself.';
        }
        if (error.kind === 'network') {
            return 'No response was received from the server. Check your connection and refresh the book list before trying again.';
        }
    }

    const actions = { add: 'addition', remove: 'deletion', like: 'like update' };
    return `The ${actions[operation]} could not be confirmed. Refresh the book list before trying again.`;
}
