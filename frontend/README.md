# bookApp
Fullstack app displaying different books. React frontend, node.js express backend, mongodb database.


**Live version in Netlify:** https://eclectic-tartufo-15ebc4.netlify.app/



## How to run the project:

**1.Clone the project.**



**2.BooksApp's frontend:**

-Run 'npm install --force' in folder.

Create local .env file, and add your backend address for variables:
-process.env.REACT_APP_books_Url_dev
-process.env.REACT_APP_loginUrl_dev
-process.env.REACT_APP_userUrl_dev

-Run 'npm start'


**3.Download MongoDB compass or create one free cluster with MongoDB Atlas (https://www.mongodb.com/atlas/database)**

-Create your own database


**4.BookApp's backend:**

-Run npm install

-Add your own .env file and include:

'MONGODB_URI' for your own MongoDB database service.
'PORT' where you would like to run your back end service (For example: PORT=3003).
'SECRET' for digitally signing generated auth token. (For example: SECRET=Example2021).

-Run 'npm start'


IN ADDITION:
-Backend also includes Netlify functions. If you use them instead of controllers, you
need to add your front end app address to local .env file for:
-process.env.USERS_ORIGIN
-process.env.BOOKS_ORIGIN
-process.env.LOGIN_ORIGIN

And run netlify dev


## Credits:

Amazing book picture is from Pexels.com. **Photographer
is Negative space.**

Link: https://www.pexels.com/photo/books-old-book-knowledge-bookstore-34592/
