const express = require('express');
const apiRouter = express.Router();
const usersRouter = require('./users');
const gamesRouter = require('./games');
const picksRouter = require('./picks');
const parlaysRouter = require('./parlays');
const picksixRouter = require('./picksix');
const potRouter = require('./pot');
const postsRouter = require('./posts');
const pickEmRouter = require('./pickem');
const jwt = require('jsonwebtoken');
const { getUserById } = require('../db');
const { JWT_SECRET } = process.env;

apiRouter.use(async (req, res, next) => {
    const prefix = "Bearer ";
    const auth = req.header('Authorization');

    if (!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET);
            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({ name, message }) {
            next({ name, message });
        }
    } else {
        next({
            name: 'MissingUserError',
            message: `You must be logged in to perform this action!`
        });
    }
});

apiRouter.use('/users', usersRouter);
apiRouter.use('/games', gamesRouter);
apiRouter.use('/picks', picksRouter);
apiRouter.use('/parlays', parlaysRouter);
apiRouter.use('/picksix', picksixRouter);
apiRouter.use('/pot', potRouter);
apiRouter.use('/posts', postsRouter);
apiRouter.use('/pickem', pickEmRouter);

apiRouter.use((error, req, res, next) => {
    res.send({
        name: error.name,
        message: error.message
    });
});

module.exports = apiRouter;