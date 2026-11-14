import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { setupStore } from './store';
import { Provider } from 'react-redux';
import { restoreSession } from './services/session';

const rootElement = document.getElementById('root');
if (rootElement === null) {
    throw new Error('Cannot start BookApp: root element is missing.');
}

const store = setupStore();
store.dispatch(restoreSession());

const root = createRoot(rootElement);

root.render(
    <BrowserRouter>
        <Provider store={store}>
            <App />
        </Provider>
    </BrowserRouter>
);
