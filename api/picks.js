const express = require('express');
const { getAllPicks, getPickById, updatePicks, addOutcomesToPicks, getPicksByUsername, createPicks } = require('../db');
const picksRouter = express.Router();

picksRouter.use((req, res, next) => {
    console.log('A request is being made to /picks');
    next();
});

picksRouter.get('/', async (req, res) => {
    const picks = await getAllPicks();

    res.send({
        picks
    });
});

picksRouter.get('/id/:pickId', async (req, res) => {
    const { pickId } = req.params;

    const pick = await getPickById(pickId);

    res.send({
        pick
    });
});

picksRouter.get('/username/:username', async (req, res) => {
    const { username } = req.params;

    const pick = await getPicksByUsername(username);

    res.send({
        pick
    });
});

picksRouter.post('/addPick', async (req, res, next) => {
    const { username, picks, parlays } = req.body;

    try {
        const pick = await createPicks({ username, picks, parlays });
        res.send({ message: 'You have made your picks!', pick});
    } catch ({ name, message }) {
        next({ name, message })
    }
});

picksRouter.patch('/id/:pickId/updatePick', async (req, res, next) => {
    const { pickId } = req.params;
    const { picks, parlays } = req.body;

    try {
        const pick = await getPickById(pickId);

        if (pick) {
            let updatedPick = await updatePicks(pickId, { picks, parlays })
            res.send({ pick: updatedPick });
        } else {
            next({
                name: 'PickNotFoundError',
                message: 'That pick does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

picksRouter.patch('/id/:pickId/updateOutcomes', async (req, res, next) => {
    const { pickId } = req.params;
    const { outcomes, parlaysOutcomes } = req.body;

    try {
        const pick = await getPickById(pickId);

        if (pick) {
            let updatedPick = await addOutcomesToPicks(pickId, { outcomes, parlaysOutcomes })
            res.send({ pick: updatedPick });
        } else {
            next({
                name: 'PickNotFoundError',
                message: 'That pick does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

module.exports = picksRouter;