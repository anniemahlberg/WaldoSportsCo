const express = require('express');
const { requireAdmin } = require('./utils');
const { getAllPoints, updatePointValues } = require('../db');
const pointsRouter = express.Router();

pointsRouter.get('/', async (req, res) => {
    const points = await getAllPoints();

    res.send({
        points
    });
});

pointsRouter.patch('/', requireAdmin, async (req, res, next) => {
    const { pick, incorrectpick, lock, incorrectlock, primetime, incorrectprimetime, primetimelock, incorrectprimetimelock } = req.body;
    let updateFields = {}

    if (pick) {
        updateFields.pick = pick;
    }

    if (incorrectpick) {
        updateFields.incorrectpick = incorrectpick;
    }

    if (lock) {
        updateFields.lock = lock;
    }

    if (incorrectlock) {
        updateFields.incorrectlock = incorrectlock;
    }

    if (primetime) {
        updateFields.primetime = primetime;
    }

    if (incorrectprimetime) {
        updateFields.incorrectprimetime = incorrectprimetime;
    }

    if (primetimelock) {
        updateFields.primetimelock = primetimelock;
    }

    if (incorrectprimetimelock) {
        updateFields.incorrectprimetimelock = incorrectprimetimelock;
    }

    try {
        const updatedPointValues = await updatePointValues(1, updateFields);
        res.send({pointValues: updatedPointValues})
    } catch ({name, message}) {
        next({name, message})
    }
})

module.exports = pointsRouter