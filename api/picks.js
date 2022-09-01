const express = require('express');
const { getAllPicks, getPickById, updatePick, createPick, getWeeklyPickByUsername, getAllWeeklyPicks, createWeeklyPick, getWeeklyPickById, getGameById, updateWeeklyPick, getAllActiveWeeklyPicks} = require('../db');
const { requireUser, requireAdmin } = require('./utils');
const picksRouter = express.Router();

picksRouter.get('/', async (req, res) => {
    const picks = await getAllPicks();

    res.send({
        picks
    });
});

picksRouter.get('/weeklyPicks', async (req, res) => {
    const weeklypicks = await getAllActiveWeeklyPicks();

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

picksRouter.post('/addPick', requireUser, async (req, res, next) => {
    const { gameid, type, bet, text, lock, worth } = req.body;
    const weeklyPick = await getWeeklyPickByUsername(req.user.username)

    try {
        if (weeklyPick ) {
            const pick = await createPick({ weeklyid: weeklyPick.id, gameid, type, bet, text, lock, worth });
            if (pick) {
                res.send({ message: 'You have made a pick!', pick});
            } else {
                res.send({message: `You have already made a ${type} pick for this game!`, name: "DuplicatePickError"})
            }
        } else if (!weeklyPick) {
            const game = await getGameById(gameid)
            const newWeeklyPick = await createWeeklyPick({ username: req.user.username, week: game.week})
            const pick = await createPick({ weeklyid: newWeeklyPick.id, gameid, type, bet, text, lock, worth })
            res.send({ message: 'You have made a pick!', pick});

        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

picksRouter.patch('/pick/id/updatePick/:pickId', requireUser, async (req, res, next) => {
    const { pickId } = req.params;
    const { gameid, type, bet, text, lock, worth, pointsawarded } = req.body;
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

    if (lock && lock === true) {
        updateFields.lock = true;
    } else if (lock === false) {
        updateFields.lock = false
    }

    if (worth) {
        updateFields.worth = worth;
    }

    if (pointsawarded) {
        updateFields.pointsawarded = pointsawarded;
    }
    
    try {
        const pick = await getPickById(pickId);
        const weeklypick = await getWeeklyPickById(pick.weeklyid)
        if (pick && weeklypick.username === req.user.username) {
            let updatedPick = await updatePick(pickId, updateFields)
            res.send({ pick: updatedPick });
        } else if (pick && weeklypick.username !== req.user.username) {
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

picksRouter.patch('/pick/id/updateWeeklyPick/:weeklyPickId', requireAdmin, async (req, res, next) => {
    const { weeklyPickId } = req.params;
    const { week, active, betscorrect, totalbets, lockscorrect, totallocks, totalpoints } = req.body;
    let updateFields = {}

    if (week) {
        updateFields.week = week;
    }

    if (active) {
        updateFields.active = active;
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

    if (totalpoints) {
        updateFields.totalpoints = totalpoints;
    }
    
    try {
        const weeklypick = await getWeeklyPickById(weeklyPickId)
        if (weeklypick) {
            let updatedWeeklyPick = await updateWeeklyPick(weeklyPickId, updateFields)
            res.send({ weeklypick: updatedWeeklyPick });
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

picksRouter.delete('/deletePick/:pickId', requireUser, async (req, res, next) => {
    const { pickId } = req.params
    const pick = await getPickById(pickId)

    try {
        if (pick) {
            await deletePick(pickId);
            res.send({message: 'You have deleted your pick'})
        } else {
            next({
                name: 'PickNotFoundError',
                message: 'That pick does not exist'
            })
        }
    } catch ({name, message}) {
        next({name, message})
    }
})

module.exports = picksRouter;