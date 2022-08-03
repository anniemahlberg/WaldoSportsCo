const express = require('express');
const gamesRouter = express.Router();
const { getAllGames, createGame, updateGame, getGameById } = require('../db');

gamesRouter.use((req, res, next) => {
    console.log('A request is being made to /games');
    next();
});

gamesRouter.get('/', async (req, res) => {
    const games = await getAllGames();

    res.send({
        games
    });
});

gamesRouter.get('/:gameId', async (req, res) => {
    const { gameId } = req.params;

    const game = await getGameById(gameId);

    res.send({
        game
    });
});

gamesRouter.post('/add', async (req, res, next) => {
    const { hometeam, awayteam, level, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line } = req.body;

    try {
        const game = await createGame({
            hometeam, awayteam, level, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line
        });

        res.send({ message: 'you have added a new game!', game});
    } catch ({ name, message }) {
        next({ name, message })
    }
});

gamesRouter.patch('/:gameId', async (req, res, next) => {
    const { gameId } = req.params;
    const { hometeam, awayteam, level, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line } = req.body;

    try {
        const game = await getGameById(gameId);

        if (game) {
            let updatedGame = await updateGame(gameId, { hometeam, awayteam, level, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line })

            res.send({ game: updatedGame });
        } else {
            next({
                name: 'GameNotFoundError',
                message: 'That game does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

module.exports = gamesRouter;