import type { AuthResponse, Book } from '../types/api';
import { ApiError } from './apiError';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value);
}

function isIdArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every(isId);
}

function isOptionalNullable<T>(
    value: unknown,
    validate: (value: unknown) => value is T,
): value is T | null | undefined {
    return value === undefined || value === null || validate(value);
}

function isBook(value: unknown): value is Book {
    if (!isRecord(value)) return false;

    return (
        isId(value.id)
        && typeof value.title === 'string'
        && typeof value.author === 'string'
        && typeof value.url === 'string'
        && isOptionalNullable(value.likes, isFiniteNumber)
        && isOptionalNullable(value.user, isId)
        && isOptionalNullable(value.likesbyId, isIdArray)
    );
}

export function parseBook(value: unknown): Book {
    if (!isBook(value)) throw new ApiError('invalid-response', 'Invalid book response');
    return value;
}

export function parseBooks(value: unknown): Book[] {
    if (!Array.isArray(value) || !value.every(isBook)) {
        throw new ApiError('invalid-response', 'Invalid books response');
    }
    return value;
}

export function parseAuth(value: unknown): AuthResponse {
    if (!isRecord(value) || !isId(value.token)
        || typeof value.username !== 'string' || typeof value.email !== 'string') {
        throw new ApiError('invalid-response', 'Invalid authentication response');
    }
    // Keep only session fields; do not retain unexpected credentials in storage.
    return { token: value.token, username: value.username, email: value.email };
}
