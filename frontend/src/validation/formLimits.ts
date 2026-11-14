import validator from 'validator';
import type { CreateBookInput, SignUpInput } from '../types/api';

// Text limits use UTF-16 code units, matching HTML maxLength. Passwords use UTF-8 bytes.
export const formLimits = { username: 50, email: 254, passwordBytes: 72, title: 300, author: 255, url: 500 };

export const utf8Length = (value: string): number => new Blob([value]).size;

export function signUpError(input: SignUpInput): string | null {
    if (input.username.length < 3) return 'Username must be at least 3 characters long.';
    if (input.username.length > formLimits.username) return 'Username must be at most 50 characters long.';
    if (utf8Length(input.email) > formLimits.email) return 'Email address is too long. Please use a shorter address.';
    if (!validator.isEmail(input.email, { allow_utf8_local_part: false })) return 'Enter a valid email address (ASCII local part).';
    if (utf8Length(input.password) > formLimits.passwordBytes) return 'Password is too long. Please use a shorter password.';
    if (!validator.isStrongPassword(input.password, {
        minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
    })) return 'Password must be 8 letters long and have AT LEAST: 1 lowercase, 1 uppercase, 1 number and 1 symbol.';
    return null;
}

export function bookLengthError(input: CreateBookInput): string | null {
    for (const field of ['title', 'author', 'url'] as const) {
        if (!input[field]) return `${field} must not be empty.`;
        if (input[field].length > formLimits[field]) return `${field} must be at most ${formLimits[field]} characters long.`;
    }
    return null;
}
