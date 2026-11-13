import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../types/api';

interface UserState {
    user: AuthUser['username'] | null;
    isAuthenticated: boolean;
}

const initialState: UserState = {
    user: null,
    isAuthenticated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<AuthUser['username']>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
