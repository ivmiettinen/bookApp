// JSON contracts verified against both backend/controllers and netlify/functions.
// No currently used book endpoint populates User references.
export interface Book {
    id: string;
    title: string;
    author: string;
    url: string;
    likes?: number | null;
    user?: string | null;
    likesbyId?: string[] | null;
}

export interface CreateBookInput {
    title: string;
    author: string;
    url: string;
    likes?: number;
}

// Both PUT routes currently ignore the body and toggle a like using the URL id.
// Preserve the existing caller contract until the like flow is repaired.
export interface UpdateBookInput {
    likes: number;
}

export interface AuthUser {
    username: string;
    email: string;
}

export interface AuthResponse extends AuthUser {
    token: string;
}

export interface LoginInput {
    username: string;
    password: string;
}

export interface SignUpInput extends LoginInput {
    email: string;
}
