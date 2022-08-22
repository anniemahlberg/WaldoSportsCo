const express = require('express');
const { getAllPicks, getPickById, updatePick, addOutcomeToPick, getPicksByWeedklyId, createPick, getWeeklyPickByUsername, getAllWeeklyPicks, createWeeklyPick, getWeeklyPickById, getPicksByGameIdAndType, getGameById} = require('../db');
const { requireUser, requireAdmin } = require('./utils');
const picksRouter = express.Router();

picksRouter.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  
picksRouter.get('/', async (req, res) => {
    const picks = await getAllPicks();

    res.send({
        picks
    });
});

picksRouter.get('/weeklyPicks', async (req, res) => {
    const weeklypicks = await getAllWeeklyPicks();

    res.send({
        weeklypicks
    });
});

picksRouter.get('/pick/id/:pickId', async (req, res) => {
    const { pickId } = req.params;
    const pick = await getPickById(pickId);

    res.send({
        pick
    });
});

picksRouter.get('/username', requireUser, async (req, res) => {
    const username = req.user.username
    const weeklypick = await getWeeklyPickByUsername(username)
    if (weeklypick) {
        const picks = await getPicksByWeedklyId(weeklypick.id);
        res.send({
            picks
        })
    }

});

picksRouter.get('/weekly', requireUser, async (req, res, next) => {
    const username = req.user.username
    const weeklypick = await getWeeklyPickByUsername(username)
    if (weeklypick) {
        res.send({
            weeklypick
        })
    }
})

picksRouter.post('/addPick', requireUser, async (req, res, next) => {
    const { weeklyid, gameid, type, bet, text } = req.body;

    try {
        if (weeklyid ) {
            const pick = await createPick({ weeklyid, gameid, type, bet, text });
            res.send({ message: 'You have made a pick!', pick});
        } else {
            const game = await getGameById(gameid)
            const newWeeklyPick = await createWeeklyPick({ username: req.user.username, week: game.week})
            const pick = await createPick({ weeklyid: newWeeklyPick.id, gameid, type, bet, text })
            res.send({ message: 'You have made a pick!', pick});

        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

picksRouter.patch('/pick/id/updatePick/:pickId', requireUser, async (req, res, next) => {
    const { pickId } = req.params;
    const { gameid, type, bet, text } = req.body;
    let updateFields = {}

    if (gameid) {
        updateFields.gameid = gameid;
    }

    if (type) {
        updateFields.type = type;
    }
    
    if (bet) {
        updateFields.bet = bet;
    }

    if (text) {
        updateFields.text = text;
    }
    
    try {
        const pick = await getPickById(pickId);
        const weeklypick = await getWeeklyPickById(pick.weeklyid)
        if (pick && weeklypick.username === req.user.username) {
            let updatedPick = await updatePick(pickId, updateFields)
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

picksRouter.patch('/updateOutcomes', requireAdmin, async (req, res, next) => {
    const { gameid, type, outcome } = req.body;

    let updateFields = {}

    if (outcome) {
        updateFields.outcome = outcome;
    }

    try {
        let updatedPicks = []
        const picks = await getPicksByGameIdAndType(gameid, type);
        picks.forEach(async pick => {
            let updatedPick = await addOutcomeToPick(pick.id, updateFields);
            updatedPicks.push(updatedPick)
        })

        res.send(`Outcome added!`);
    } catch ({ name, message }) {
        next({ name, message });
    }
})

module.exports = picksRouter;