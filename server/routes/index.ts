const { Router } = require('express')
/*
* all the routes for features
*/
const postsRouter = require('./routers/posts.ts')
const usersRouter = require('./routers/users.ts')

const api = Router();

// api.use(/*'/something', model? */)
api.use('/posts', postsRouter);
api.use('/users', usersRouter);

// export default api
module.exports = api