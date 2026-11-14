import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { setupStore } from './store';
import { Provider } from 'react-redux';
import { restoreSession } from './services/session';

const store = setupStore();
store.dispatch(restoreSession());

const root = createRoot(document.getElementById('root'));

root.render(
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>
);
