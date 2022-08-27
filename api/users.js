const express = require('express');
const bcrypt = require('bcrypt');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById } = require('../db');
const { requireUser } = require('./utils')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env; 

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();
    res.send({
        users
    });
});

usersRouter.get('/currentUser', async (req, res) => {
    if (req.user) {
        let currentUser = req.user
        res.send(currentUser)
    }

    res.send(null)
})

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);
        const hashedPassword = user.password;
        const isValid = await bcrypt.compare(password, hashedPassword)
        const token = jwt.sign({ username: username, id: user.id }, JWT_SECRET)

        if (user && isValid) {
            res.send({ message: "you're logged in!", token: token, user})
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            });
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
});

usersRouter.post('/register', async (req, res, next) => {
    const { username, password, firstname, lastname, email, venmo } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser({
            username, password:hashedPassword, firstname, lastname, email, venmo
        });

        const token = jwt.sign({ id: user.id, username }, JWT_SECRET, {expiresIn: '1w'});

        res.send({ message: 'thank you for signing up', token});
    } catch ({ name, message }) {
        next({ name, message })
    }
}); 

usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
    const { userId } = req.params;
    const { username, password, firstname, lastname, email, venmo, admin, betscorrect, totalbets, lockscorrect, totallocks  } = req.body;
    let updateFields = {}

    if (username) {
        updateFields.username = username;
    }

    if (password) {
        updateFields.password = password;
    }

    if (firstname) {
        updateFields.firstname = firstname;
    }

    if (lastname) {
        updateFields.lastname = lastname;
    }

    if (email) {
        updateFields.email = email;
    }

    if (venmo) {
        updateFields.venmo = venmo;
    }

    if (admin) {
        updateFields.admin = admin;
    }

    if (betscorrect) {
        updateFields.betscorrect = betscorrect;
    }

    if (totalbets) {
        updateFields.totalbets = totalbets;
    }

    if (lockscorrect) {
        updateFields.lockscorrect = lockscorrect;
    }

    if (totallocks) {
        updateFields.totallocks = totallocks;
    }
    
    try {
        const user = await getUserById(userId);
        if (user && user.username === req.user.username) {
            let updatedUser = await updatePicks(userId, updateFields)
            res.send({ user: updatedUser });
        } else if (user && user.username !== req.user.username) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot edit a user that is not you'
            })
        } else {
            next({
                name: 'UserNotFoundError',
                message: 'That user does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

module.exports = usersRouter;