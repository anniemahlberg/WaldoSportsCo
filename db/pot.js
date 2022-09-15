const client = require('./client')

async function getAllPotAmounts() {
    try {
        const { rows: potAmounts } = await client.query(
            `SELECT *
            FROM liopot
            ORDER BY id;
            `);
        
        return potAmounts;
    } catch (error) {
        throw error;
    }
}

async function getPotById(potId) {
    try {
        const { rows: [potAmount] } = await client.query(
            `SELECT *
            FROM liopot
            WHERE id=$1;
            `, [potId] );
        
        return potAmount;
    } catch (error) {
        throw error;
    }
}

async function getPotAmountByWeek(week) {
    try {
        const { rows: [potAmount] } = await client.query(
            `SELECT *
            FROM liopot
            WHERE week=$1;
            `, [week] );
        
        return potAmount;
    } catch (error) {
        throw error;
    }
}

async function addPotAmount(week, amount) {
    try {
        const { rows: [potAmount] } = await client.query(`
            INSERT INTO liopot (week, amount)
            VALUES ($1, $2)
            RETURNING *
        `, [week, amount])

        return potAmount;
    } catch (error) {
        throw error;
    }
}

async function editPotAmount(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ potAmount ] } = await client.query(`
            UPDATE liopot
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return potAmount;
    } catch (error) {
        throw error;
    }
}

async function deletePotAmount(potId) {
    try {
        const { rows: [potAmount] } = await client.query(`
            DELETE FROM liopot
            WHERE id=$1
        `, [potId]) 

       return potAmount;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllPotAmounts,
    getPotById,
    getPotAmountByWeek,
    addPotAmount,
    editPotAmount,
    deletePotAmount
}