import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type NotificationStatus = 'success' | 'error';

export interface Notification {
    status: NotificationStatus;
    message: string;
}

interface UiState {
    notification: Notification | null;
}

const initialState: UiState = { notification: null };

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        showNotification(state, action: PayloadAction<Notification>) {
            state.notification = {
                status: action.payload.status,
                message: action.payload.message,
            };
        },
        resetNotification(state) {
            state.notification = null;
        },
    },
});

export const uiActions = uiSlice.actions;
export default uiSlice.reducer;
