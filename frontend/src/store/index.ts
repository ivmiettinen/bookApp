import { combineReducers, configureStore } from '@reduxjs/toolkit';
import type { Action, PreloadedState, ThunkAction } from '@reduxjs/toolkit';
import bookReducer from './book-slice';
import uiReducer from './ui-slice';
import userReducer from './user-slice';

const rootReducer = combineReducers({
    books: bookReducer,
    ui: uiReducer,
    user: userReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
    configureStore({ reducer: rootReducer, preloadedState });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
