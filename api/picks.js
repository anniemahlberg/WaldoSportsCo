const express = require('express');
const { getAllPicks, getPickById, updatePicks, addOutcomesToPicks, getPicksByUsername, createPicks } = require('../db');
const { requireUser, requireAdmin } = require('./utils');
const picksRouter = express.Router();

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

picksRouter.post('/addPick', requireUser, async (req, res, next) => {
    const { picks, parlays } = req.body;

    try {
        const pick = await createPicks({ username: req.user.username, picks, parlays });
        res.send({ message: 'You have made your picks!', pick});
    } catch ({ name, message }) {
        next({ name, message })
    }
});

picksRouter.patch('/id/:pickId/updatePick', requireUser, async (req, res, next) => {
    const { pickId } = req.params;
    const { picks, parlays } = req.body;
    let updateFields = {}

    if (picks) {
        updateFields.picks = picks;
    }

    if (parlays) {
        updateFields.parlays = parlays;
    }
    
    try {
        const pick = await getPickById(pickId);
        if (pick && pick.username === req.user.username) {
            let updatedPick = await updatePicks(pickId, updateFields)
            res.send({ pick: updatedPick });
        } else if (pick && pick.username !== req.user.username) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot edit a pick that is not yours'
            })
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

picksRouter.patch('/id/:pickId/updateOutcomes', requireAdmin, async (req, res, next) => {
    const { pickId } = req.params;
    const { outcomes, parlaysOutcomes } = req.body;

    let updateFields = {}

    if (outcomes) {
        updateFields.outcomes = outcomes;
    }

    if (parlaysOutcomes) {
        updateFields.parlaysOutcomes = parlaysOutcomes;
    }

    try {
        const pick = await getPickById(pickId);

        if (pick && req.user.username) {
            let updatedPick = await addOutcomesToPicks(pickId, updateFields)
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