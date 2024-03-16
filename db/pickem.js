const client = require('./client')

async function createPickEmPick({ weeklyid, gameid, type, bet, text}) {
    try {
        const { rows: [ picksixPick ] } = await client.query(`
            INSERT INTO picksix(weeklyid, gameid, type, bet, text)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (weeklyid, gameid, type) DO NOTHING
            RETURNING *;
        `, [weeklyid, gameid, type, bet, text]);

        return picksixPick;
    } catch (error) {
        throw error;
    }
}

async function getAllPickEmPicks() {
    try {
        const { rows: pickemPicks } = await client.query(`
            SELECT *
            FROM pickem
            ORDER BY id;
        `);
        
        return pickemPicks;
    } catch (error) {
        throw error;
    }
}

async function getPickEmPicksByWeeklyId(weeklyid) {
    try {
        const { rows: pickemPicks } = await client.query(`
            SELECT *
            FROM pickem
            WHERE weeklyid=$1
            ORDER BY id;
        `, [weeklyid]);

        return pickemPicks;
    } catch (error) {
        throw error;
    }
}

async function getPickEmPickById(pickId) {
    try {
        const { rows: [ pickemPick ]} = await client.query(`
            SELECT *
            FROM pickem
            WHERE id=$1
            ORDER BY id;
        `, [pickId])

        return pickemPick;
    } catch (error) {
        throw error;
    }
}

async function getPickEmPicksByGameId(gameid) {
    try {
        const { rows: pickemPicks } = await client.query(`
            SELECT *
            FROM pickem
            WHERE gameid=$1
            ORDER BY id;
        `, [gameid])

        return pickemPicks
    } catch (error) {
        throw error;
    }
}

async function getPickEmPicksByGameIdAndType(gameid, type) {
    try {
        const { rows: pickemPicks } = await client.query(`
            SELECT *
            FROM pickem
            WHERE gameid=$1 AND type=$2
            ORDER BY id;
        `, [gameid, type])

        return pickemPicks;
    } catch (error) {
        throw error;
    }
}

async function updatePickEmPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ pickemPick ] } = await client.query(`
            UPDATE pickem
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return pickemPick;
    } catch (error) {
        throw error;
    }
}

async function addOutcomeToPickEmPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ pickemPick ] } = await client.query(`
            UPDATE pickem
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return pickemPick;
    } catch (error) {
        throw error;
    }
}

async function deletePickEm(pickId) {
    try {
       const { rows: [pickemPick] } = await client.query(`
            DELETE FROM pickem
            WHERE id=$1
       `, [pickId]) 

       return pickemPick;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createPickEmPick,
    getAllPickEmPicks,
    getPickEmPicksByWeeklyId,
    updatePickEmPick,
    addOutcomeToPickEmPick,
    getPickEmPickById,
    getPickEmPicksByGameId,
    getPickEmPicksByGameIdAndType,
    deletePickEm
}