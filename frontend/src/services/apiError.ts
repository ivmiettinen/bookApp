import axios from 'axios';

export type ApiErrorKind = 'configuration' | 'invalid-response' | 'http' | 'network' | 'unexpected';

export class ApiError extends Error {
    constructor(
        public readonly kind: ApiErrorKind,
        message: string,
        // Retain the HTTP shape used by existing auth thunks. Data is untrusted.
        public readonly response?: { status: number; data: unknown },
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest<T>(request: () => Promise<T>): Promise<T> {
    try {
        return await request();
    } catch (error: unknown) {
        if (error instanceof ApiError) throw error;
        if (axios.isAxiosError<unknown>(error)) {
            if (error.response) {
                throw new ApiError('http', 'API request failed', {
                    status: error.response.status,
                    data: error.response.data,
                });
            }
            if (error.request) throw new ApiError('network', 'API could not be reached');
        }
        throw new ApiError('unexpected', 'Unexpected API request failure');
    }
}
