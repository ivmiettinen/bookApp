# bookApp
Fullstack app displaying different books. React frontend, node.js express backend, mongodb database.


**Live version in Netlify:** https://eclectic-tartufo-15ebc4.netlify.app/



## How to run the project:

**1.Clone the project.**



**2.BooksApp's frontend:**

Use Node.js 22.12.0 or newer. Run `npm ci` in the frontend folder to install dependencies from package-lock.json.

Create a local `.env` file from `.env.example` and set your backend addresses:
- `VITE_BOOKS_URL_DEV`
- `VITE_LOGIN_URL_DEV`
- `VITE_USER_URL_DEV`

Run `npm start` (or `npm run dev`) to start the frontend.

| Command | Purpose |
| --- | --- |
| `npm run eslint` | Check code style |
| `npm run typecheck` | Check TypeScript types |
| `npm run test:run` | Run tests once (`npm test` for watch mode) |
| `npm run build` | Create the production build in `dist` |
| `npm run preview` | Preview the production build locally |

For production, set `VITE_BOOKS_URL`, `VITE_LOGIN_URL` and `VITE_USER_URL` before building,
using `.env.production.local` or your hosting settings. Frontend variables are public: never add secrets.
Existing `REACT_APP_*` fallbacks still work; see [API_CONTRACTS.md](API_CONTRACTS.md) for details.

For Netlify, use base directory `frontend`, build command `npm run build` and publish directory `dist`.
The included SPA fallback supports direct routes such as `/books` and `/signup`.
CI installs dependencies and runs lint, typecheck, tests and build. The live deployment has not been verified.


**3.Download MongoDB compass or create one free cluster with MongoDB Atlas (https://www.mongodb.com/atlas/database)**

-Create your own database


**4.BookApp's backend:**

-Run npm install

-Add your own .env file and include:

'MONGODB_URI' for your own MongoDB database service.
'PORT' where you would like to run your back end service (For example: PORT=3003).
'SECRET' for digitally signing generated auth tokens (use your own random secret).

-Run 'npm start'


IN ADDITION:
-Backend also includes Netlify functions. If you use them instead of controllers, you
need to add your front end app address to the backend .env file for:
-process.env.USERS_ORIGIN
-process.env.BOOKS_ORIGIN
-process.env.LOGIN_ORIGIN

And run netlify dev


## Credits:

Amazing book picture is from Pexels.com. **Photographer
is Negative space.**

Link: https://www.pexels.com/photo/books-old-book-knowledge-bookstore-34592/
