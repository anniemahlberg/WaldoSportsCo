const express = require('express');
const { getAllPicksixPicks, 
        getPicksixPickById, 
        updatePicksixPick, 
        createPicksixPick, 
        createWeeklyPick, 
        getGameById, 
        getWeeklyPickById, 
        getWeeklyPickByUsername, 
        updateWeeklyPick, 
        getPicksixPicksByPickNumberAndWeeklyId, 
        getAllActiveWeeklyPicksByWeek, 
        updateUser, 
        getUserByUsername,
        deletePicksix, 
        } = require('../db');
const { requireUser, requireAdmin } = require('./utils');
const picksixRouter = express.Router();

picksixRouter.get('/', async (req, res) => {
    const picksixPicks = await getAllPicksixPicks();

    res.send({
        picksixPicks
    });
});

picksixRouter.get('/picksix/id/:pickId', async (req, res) => {
    const { pickId } = req.params;
    const picksixPick = await getPicksixPickById(pickId);

    res.send({
        picksixPick
    });
});

picksixRouter.post('/addPicksixPick', requireUser, async (req, res, next) => {
    const { picknumber, gameid, type, bet, text } = req.body;
    const weeklyPick = await getWeeklyPickByUsername(req.user.username)

    try {
        if (weeklyPick ) {
            if (picknumber == 1) {
                const firstPicksixPicks = await getPicksixPicksByPickNumberAndWeeklyId(1, weeklyPick.id);
                if (firstPicksixPicks.length && firstPicksixPicks.length >= 6) {
                    next({
                        name: "MaximumPicksReachedError",
                        message: "You have already made 6 picks for your parlay."
                    })
                } else {
                    const picksixPick = await createPicksixPick({ weeklyid: weeklyPick.id, picknumber, gameid, type, bet, text });
                    if (picksixPick) {
                        res.send({ message: 'You have made a picksix pick!', picksixPick});
                    } else {
                        res.send({message: `You have already made a ${type} pick for this game!`, name: "DuplicatePickError"})
                    }
                }
            }
        } else if (!weeklyPick) {
            const game = await getGameById(gameid)
            const newWeeklyPick = await createWeeklyPick({ username: req.user.username, week: game.week})
            const picksixPick = await createPicksixPick({ weeklyid: newWeeklyPick.id, picknumber, gameid, type, bet, text })
            res.send({ message: 'You have made a picksix pick!', picksixPick});
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

picksixRouter.patch('/picksix/id/updatePicksixPick/:pickId', requireUser, async (req, res, next) => {
    const { pickId } = req.params;
    const { picknumber, gameid, type, bet, text } = req.body;
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

    if (picknumber) {
        updateFields.picknumber = picknumber;
    }
    
    try {
        const picksixPick = await getPicksixPickById(pickId);
        const weeklypick = await getWeeklyPickById(picksixPick.weeklyid)
        if (picksixPick && weeklypick.username === req.user.username) {
            let updatedPicksixPick = await updatePicksixPick(pickId, updateFields)
            res.send({ picksixPick: updatedPicksixPick });
        } else if (picksixPick && weeklypick.username !== req.user.username) {
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

picksixRouter.patch('/picksix/id/updateWeeklyPick/:weeklyPickId', requireAdmin, async (req, res, next) => {
    const { weeklyPickId } = req.params;
    const { week, active, betscorrect, totalbets, lockscorrect, totallocks, parlayscorrect, totalparlays, totalpoints, totalpicksix, picksixcorrect } = req.body;
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

    if (totalpicksix) {
        updateFields.totalpicksix = totalpicksix;
    }

    if (picksixcorrect) {
        updateFields.picksixcorrect = picksixcorrect;
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

picksixRouter.patch('/updateResults/pick1', requireAdmin, async (req, res, next) => {
    const { week } = req.body;

    try {
        const allweeklypicks = await getAllActiveWeeklyPicksByWeek(week)
        if (allweeklypicks) {
            allweeklypicks.forEach(async (weeklyPick) => {
                const user = await getUserByUsername(weeklyPick.username)
                const allPicksixOnePicks = await getPicksixPicksByPickNumberAndWeeklyId(1, weeklyPick.id);
                const picksixOnePicks = allPicksixOnePicks.filter(picksixPick => picksixPick.statsupdated === false)

                if (allPicksixOnePicks.length) {
    
                    let pickshit = 0;
                    let picksmiss = 0;
                    let pickstbd = 0;
                    let pickspush = 0;
    
                    allPicksixOnePicks.forEach(async (picksixPick) => {
                        if (picksixPick.result === "HIT") {
                            pickshit++;
                        } else if (picksixPick.result === "MISS") {
                            picksmiss++;
                        } else if (picksixPick.result === "PUSH") {
                            pickspush++
                        } else if (picksixPick.result === "tbd") {
                            pickstbd++
                        }
                    })

                    if (pickstbd > 0 || !picksixOnePicks.length) {
                        return;
                    } else if (picksmiss > 0) {
                        picksixOnePicks.forEach(async (picksixPick) => {
                            await updatePicksixPick(picksixPick.id, {statsupdated: true})
                        })
                        await updateWeeklyPick(weeklyPick.id, {totalpicksix: weeklyPick.totalpicksix + 1})
                        await updateUser(user.id, {totalpicksix: user.totalpicksix + 1})
                    } else if (pickspush > 0) {
                        picksixOnePicks.forEach(async (picksixPick) => {
                            await updatePicksixPick(picksixPick.id, {statsupdated: true})
                        })
                        await updateWeeklyPick(weeklyPick.id, {totalpicksix: weeklyPick.totalpicksix + 1})
                        await updateUser(user.id, {totalpicksix: user.totalpicksix + 1})
                    } else if (pickshit === allPicksixOnePicks.length) {
                        picksixOnePicks.forEach(async (picksixPick) => {
                            await updatePicksixPick(picksixPick.id, {statsupdated: true})
                        })
                        await updateWeeklyPick(weeklyPick.id, {totalpicksix: weeklyPick.totalpicksix + 1, picksixcorrect: weeklyPick.picksixcorrect + 1})
                        await updateUser(user.id, {picksixcorrect: user.picksixcorrect + 1, totalpicksix: user.totalpicksix + 1})
                    }
                    
                }
            })
        }
    } catch ({name, message}) {
        next({name, message})
    }
})

picksixRouter.delete('/deletePicksix/:pickId', requireUser, async (req, res, next) => {
    const { pickId } = req.params
    const picksix = await getPicksixPickById(pickId)

    try {
        if (picksix) {
            await deletePicksix(pickId);
            res.send({message: 'You have deleted your parlay'})
        } else {
            next({
                name: 'ParlayNotFoundError',
                message: 'That parlay does not exist'
            })
        }
    } catch ({name, message}) {
        next({name, message})
    }
})


module.exports = picksixRouter;