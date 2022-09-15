const express = require('express');
const potRouter = express.Router();
const { getAllPotAmounts,  getPotById, getPotAmountByWeek, addPotAmount, editPotAmount, deletePotAmount } = require('../db');
const { requireAdmin } = require('./utils')

potRouter.get('/', async (req, res) => {
    const potAmounts = await getAllPotAmounts();
    res.send({
        potAmounts
    });
});

potRouter.get('/week/:week', async (req, res) => {
    const { week } = req.params;

    const potAmount = await getPotAmountByWeek(Number(week));
    res.send({
        potAmount
    });
});

potRouter.get('/id/:id', async (req, res) => {
    const { id } = req.params;

    const potAmount = await getPotById(id);
    res.send({
        potAmount
    });
});

potRouter.post('/add', requireAdmin, async (req, res, next) => {
    const { week, amount } = req.body;

    try {
        if (req.user.username) {
            const potAmount = await addPotAmount(week, amount);
    
            res.send({ message: 'You have added a new pot amount!', potAmount});
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You are not allowed to add to the pot'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

potRouter.patch('/week/:week', requireAdmin, async (req, res, next) => {
    const { week } = req.params;
    const { amount } = req.body;
    let updateFields = {};

    if (amount) {
        updateFields.amount = amount;
    }

    try {
        const pot = await getPotAmountByWeek(week);

        if (pot) {
            let updatedPot = await editPotAmount(pot.id, updateFields)
            res.send({ pot: updatedPot });
        } else if (pot) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot update the pot'
            })
        } else {
            next({
                name: 'PotNotFoundError',
                message: 'That pot does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

potRouter.delete('/id/:id', async (req, res, next) => {
    const { id } = req.params
    const pot = await getPotById(id)

    try {
        if (pot) {
            await deletePotAmount(id);
            res.send({message: 'You have deleted a pot'})
        } else {
            next({
                name: 'PotNotFoundError',
                message: 'That pot does not exist'
            })
        }
    } catch ({name, message}) {
        next({name, message})
    }
})

module.exports = potRouter
