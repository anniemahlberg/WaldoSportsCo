const express = require('express');
const { getAllParlayPicks, getParlayPickById, updateParlayPick, createParlayPick, createWeeklyPick, getGameById, getWeeklyPickById, getWeeklyPickByUsername, updateWeeklyPick, getParlayPicksByParlayNumberAndWeeklyId} = require('../db');
const { requireUser, requireAdmin } = require('./utils');
const parlaysRouter = express.Router();

parlaysRouter.get('/', async (req, res) => {
    const parlayPicks = await getAllParlayPicks();

    res.send({
        parlayPicks
    });
});

parlaysRouter.get('/parlay/id/:parlayId', async (req, res) => {
    const { parlayId } = req.params;
    const parlayPick = await getParlayPickById(parlayId);

    res.send({
        parlayPick
    });
});

parlaysRouter.post('/addParlayPick', requireUser, async (req, res, next) => {
    const { parlaynumber, gameid, type, bet, text } = req.body;
    const weeklyPick = await getWeeklyPickByUsername(req.user.username)

    try {
        if (weeklyPick ) {
            if (parlaynumber == 1) {
                const firstParlayPicks = await getParlayPicksByParlayNumberAndWeeklyId(1, weeklyPick.id);
                const secondParlayPicks = await getParlayPicksByParlayNumberAndWeeklyId(2, weeklyPick.id)
                if (firstParlayPicks && secondParlayPicks && firstParlayPicks.length > 2) {
                    next({
                        name: "MaximumPicksReachedError",
                        message: "Since you have 2 parlays, you can only have 2 picks in each."
                    })
                } else if (firstParlayPicks && firstParlayPicks.length > 4) {
                    next({
                        name: "MaximumPicksReachedError",
                        message: "You have already made 4 picks for your parlay."
                    })
                }
            } else if (parlaynumber == 2) {
                const firstParlayPicks = await getParlayPicksByParlayNumberAndWeeklyId(1, weeklyPick.id);
                const secondParlayPicks = await getParlayPicksByParlayNumberAndWeeklyId(2, weeklyPick.id)
                if (firstParlayPicks && firstParlayPicks.length > 2) {
                    next({
                        name: "IllegalParlayError",
                        message: `Your first parlay had ${firstParlayPicks.length} picks, therefore you cannot make a second parlay.`
                    })
                } else if (secondParlayPicks && secondParlayPicks.length > 2) {
                    next({
                        name: "IllegalParlayError",
                        message: `You have already made 2 picks for your second parlay.`
                    })
                }
            } else {
                const parlayPick = await createParlayPick({ weeklyid: weeklyPick.id, parlaynumber, gameid, type, bet, text });
                if (parlayPick) {
                    res.send({ message: 'You have made a parlay pick!', parlayPick});
                } else {
                    res.send({message: `You have already made a ${type} pick for this game!`, name: "DuplicatePickError"})
                }
            }
        } else if (!weeklyPick) {
            const game = await getGameById(gameid)
            const newWeeklyPick = await createWeeklyPick({ username: req.user.username, week: game.week})
            const parlayPick = await createParlayPick({ weeklyid: newWeeklyPick.id, parlaynumber, gameid, type, bet, text })
            res.send({ message: 'You have made a parlay pick!', parlayPick});
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

parlaysRouter.patch('/parlay/id/updateParlayPick/:parlayId', requireUser, async (req, res, next) => {
    const { parlayId } = req.params;
    const { parlaynumber, gameid, type, bet, text } = req.body;
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

    if (parlaynumber) {
        updateFields.parlaynumber = parlaynumber;
    }
    
    try {
        const parlayPick = await getParlayPickById(parlayId);
        const weeklypick = await getWeeklyPickById(parlayPick.weeklyid)
        if (parlayPick && weeklypick.username === req.user.username) {
            let updatedParlayPick = await updateParlayPick(parlayId, updateFields)
            res.send({ parlayPick: updatedParlayPick });
        } else if (parlayPick && weeklypick.username !== req.user.username) {
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

parlaysRouter.patch('/parlay/id/updateWeeklyPick/:weeklyPickId', requireAdmin, async (req, res, next) => {
    const { weeklyPickId } = req.params;
    const { week, active, betscorrect, totalbets, lockscorrect, totallocks, parlayscorrect, totalparlays, totalpoints } = req.body;
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

    if (parlayscorrect) {
        updateFields.parlayscorrect = parlayscorrect;
    }

    if (totalparlays) {
        updateFields.totalparlays = totalparlays;
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

module.exports = parlaysRouter;