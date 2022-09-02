const client = require('./client')

async function createParlayPick({ weeklyid, parlaynumber, gameid, type, bet, text}) {
    try {
        const { rows: [ parlayPick ] } = await client.query(`
            INSERT INTO parlays(weeklyid, parlaynumber, gameid, type, bet, text)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (weeklyid, parlaynumber, gameid, type) DO NOTHING
            RETURNING *;
        `, [weeklyid, parlaynumber, gameid, type, bet, text]);

        return parlayPick;
    } catch (error) {
        throw error;
    }
}

async function getAllParlayPicks() {
    try {
        const { rows: parlayPicks } = await client.query(`
            SELECT *
            FROM parlays
            ORDER BY id;
        `);
        
        return parlayPicks;
    } catch (error) {
        throw error;
    }
}

async function getParlayPicksByWeeklyId(weeklyid) {
    try {
        const { rows: parlayPicks } = await client.query(`
            SELECT *
            FROM parlays
            WHERE weeklyid=$1
            ORDER BY id;
        `, [weeklyid]);

        return parlayPicks;
    } catch (error) {
        throw error;
    }
}

async function getParlayPickById(parlayPickId) {
    try {
        const { rows: [ parlayPick ]} = await client.query(`
            SELECT *
            FROM parlays
            WHERE id=$1
            ORDER BY id;
        `, [parlayPickId])

        return parlayPick;
    } catch (error) {
        throw error;
    }
}

async function getParlayPicksByGameId(gameid) {
    try {
        const { rows: parlayPicks } = await client.query(`
            SELECT *
            FROM parlays
            WHERE gameid=$1
            ORDER BY id;
        `, [gameid])

        return parlayPicks
    } catch (error) {
        throw error;
    }
}

async function getParlayPicksByGameIdAndType(gameid, type) {
    try {
        const { rows: parlayPicks } = await client.query(`
            SELECT *
            FROM parlays
            WHERE gameid=$1 AND type=$2
            ORDER BY id;
        `, [gameid, type])

        return parlayPicks;
    } catch (error) {
        throw error;
    }
}

async function getParlayPicksByParlayNumber(parlaynumber) {
    try {
        const { rows: parlayPicks } = await client.query(`
            SELECT *
            FROM parlays
            WHERE parlaynumber=$1
            ORDER BY id;
        `, [parlaynumber])

        return parlayPicks;
    } catch (error) {
        throw error;
    }
}

async function getParlayPicksByParlayNumberAndWeeklyId(parlaynumber, weeklyid) {
    try {
        const { rows: parlayPicks } = await client.query(`
            SELECT * 
            FROM parlays
            WHERE parlaynumber=$1 AND weeklyid=$2
            ORDER BY id;
        `, [parlaynumber, weeklyid])

        return parlayPicks;
    } catch (error) {
        throw error;
    }
}

async function updateParlayPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ parlayPick ] } = await client.query(`
            UPDATE parlays
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return parlayPick;
    } catch (error) {
        throw error;
    }
}

async function addOutcomeToParlayPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ parlayPick ] } = await client.query(`
            UPDATE parlays
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return parlayPick;
    } catch (error) {
        throw error;
    }
}

async function deleteParlay(parlayId) {
    try {
       const { rows: [parlayPick] } = await client.query(`
            DELETE FROM parlays
            WHERE id=$1
       `, [parlayPick]) 

       return parlayPick;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createParlayPick,
    getAllParlayPicks,
    getParlayPicksByWeeklyId,
    updateParlayPick,
    addOutcomeToParlayPick,
    getParlayPickById,
    getParlayPicksByGameId,
    getParlayPicksByGameIdAndType,
    getParlayPicksByParlayNumber,
    getParlayPicksByParlayNumberAndWeeklyId,
    deleteParlay
}