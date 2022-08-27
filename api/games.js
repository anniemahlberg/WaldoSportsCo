const express = require('express');
const gamesRouter = express.Router();
const { getAllGames, createGame, updateGame, getGameById, getPicksByGameIdAndType, addOutcomeToPick, getAllGamesByWeek, getAllActiveGames, getWeeklyPickById } = require('../db');
const { requireAdmin } = require('./utils');

gamesRouter.get('/', async (req, res) => {
    const games = await getAllGames();

    res.send({
        games
    });
});

gamesRouter.get('/active', async (req, res) => {
    const games = await getAllActiveGames();

    res.send({
        games
    });
});

gamesRouter.get('/byWeek/:week', async (req, res) => {
    const { week } = req.params
    const games = await getAllGamesByWeek(week);

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

gamesRouter.post('/add', requireAdmin, async (req, res, next) => {
    const { week, hometeam, awayteam, level, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line } = req.body;

    try {
        if (req.user.username) {
            const game = await createGame({
                week, hometeam, awayteam, level, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line
            });
    
            res.send({ message: 'you have added a new game!', game});
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You are not allowed to add games'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

gamesRouter.patch('/:gameId', requireAdmin, async (req, res, next) => {
    const { gameId } = req.params;
    const { hometeam, awayteam, level, week, date, time, primetime, value, duration, over, under, chalk, dog, totalpoints, favoredteam, line, active } = req.body;
    let updateFields = {};

    if (hometeam) {
        updateFields.hometeam = hometeam;
    }

    if (awayteam) {
        updateFields.awayteam = awayteam;
    }

    if (level) {
        updateFields.level = level;
    }

    if (week) {
        updateFields.week = week;
    }

    if (date) {
        updateFields.date = date;
    }

    if (time) {
        updateFields.time = time;
    }

    if (primetime) {
        updateFields.primetime = primetime;
    }

    if (value) {
        updateFields.value = value;
    }

    if (duration) {
        updateFields.duration = duration;
    }

    if (over) {
        updateFields.over = over;
    }

    if (under) {
        updateFields.under = under;
    }

    if (chalk) {
        updateFields.chalk = chalk;
    }

    if (dog) {
        updateFields.dog = dog;
    }

    if (totalpoints) {
        updateFields.totalpoints = totalpoints;
    }

    if (favoredteam) {
        updateFields.favoredteam = favoredteam;
    }

    if (line) {
        updateFields.line = line;
    }

    if (active) {
        updateFields.active = active;
    }

    try {
        const game = await getGameById(gameId);

        if (game) {
            let updatedGame = await updateGame(gameId, updateFields)
            res.send({ game: updatedGame });
        } else if (game) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update games'
            })
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

gamesRouter.patch('/updateResults/:gameId', requireAdmin, async (req, res, next) => {
    const { gameId } = req.params;
    const { totalpointsoutcome, lineoutcome, totalpointsoutcometext, lineoutcometext } = req.body;
    let updateFields = {};

    if (totalpointsoutcome) {
        updateFields.totalpointsoutcome = totalpointsoutcome;
    }
    if (lineoutcome) {
        updateFields.lineoutcome = lineoutcome;
    }

    try {
        const game = await getGameById(gameId);

        if (game) {
            let updatedGame = await updateGame(gameId, updateFields)
            if ((game.chalk || game.dog) && lineoutcome) {
                const picksToUpdate = await getPicksByGameIdAndType(gameId, "line")
                if (picksToUpdate) {
                    let updatedPicks = []
                    picksToUpdate.forEach(async pick => {
                        let updateFieldsForPick = {
                            outcome: lineoutcome,
                            outcometext: lineoutcometext
                        }

                        if (pick.bet === lineoutcome) {
                            updateFieldsForPick.pointsawarded = pick.worth
                        } else if (lineoutcome === "push") {
                            updateFieldsForPick.pointsawarded = 0;
                        } else {
                            updateFieldsForPick.pointsawarded = -pick.worth;
                        }

                        let updatedPick = await addOutcomeToPick(pick.id, updateFieldsForPick);
                        updatedPicks.push(updatedPick)

                        const weeklypick = await getWeeklyPickById(pick.weeklyid)
                        weeklypick.totalbets += 1;

                        if (pick.pointsawarded > 0) {
                            weeklypick.betscorrect += 1;
                        }

                        if (pick.lock && pick.pointsawarded > 0) {
                            weeklypick.lockscorrect += 1;
                            weeklypick.totallocks += 1;
                        } else if (pick.lock && pick.pointsawarded < 0) {
                            weeklypick.totallocks += 1;
                        }

                    })
                }
            }

            if ((game.over || game.under) && totalpointsoutcome) {
                const picksToUpdate = await getPicksByGameIdAndType(gameId, "totalpoints")
                if (picksToUpdate) {
                    let updatedPicks = []
                    picksToUpdate.forEach(async pick => {
                        let updateFieldsForPick = {
                            outcome: totalpointsoutcome,
                            outcometext: totalpointsoutcometext
                        }

                        if (pick.bet === totalpointsoutcome) {
                            updateFieldsForPick.pointsawarded = pick.worth
                        } else if (totalpointsoutcome === "push") {
                            updateFieldsForPick.pointsawarded = 0;
                        } else {
                            updateFieldsForPick.pointsawarded = -pick.worth;
                        }

                        let updatedPick = await addOutcomeToPick(pick.id, updateFieldsForPick);
                        updatedPicks.push(updatedPick)

                        const weeklypick = await getWeeklyPickById(pick.weeklyid)
                        weeklypick.totalbets += 1;

                        if (pick.pointsawarded > 0) {
                            weeklypick.betscorrect += 1;
                        }

                        if (pick.lock && pick.pointsawarded > 0) {
                            weeklypick.lockscorrect += 1;
                            weeklypick.totallocks += 1;
                        } else if (pick.lock && pick.pointsawarded < 0) {
                            weeklypick.totallocks += 1;
                        }
                    })
                }
            }            

            res.send({ game: updatedGame });

        } else if (game) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update games'
            })
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