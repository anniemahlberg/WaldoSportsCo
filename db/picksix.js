const client = require('./client')

async function createPicksixPick({ weeklyid, picknumber, gameid, type, bet, text}) {
    try {
        const { rows: [ picksixPick ] } = await client.query(`
            INSERT INTO picksix(weeklyid, picknumber, gameid, type, bet, text)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (weeklyid, picknumber, gameid, type) DO NOTHING
            RETURNING *;
        `, [weeklyid, picknumber, gameid, type, bet, text]);

        return picksixPick;
    } catch (error) {
        throw error;
    }
}

async function getAllPicksixPicks() {
    try {
        const { rows: picksixPicks } = await client.query(`
            SELECT *
            FROM picksix
            ORDER BY id;
        `);
        
        return picksixPicks;
    } catch (error) {
        throw error;
    }
}

async function getPicksixPicksByWeeklyId(weeklyid) {
    try {
        const { rows: picksixPicks } = await client.query(`
            SELECT *
            FROM picksix
            WHERE weeklyid=$1
            ORDER BY id;
        `, [weeklyid]);

        return picksixPicks;
    } catch (error) {
        throw error;
    }
}

async function getPicksixPickById(pickId) {
    try {
        const { rows: [ picksixPick ]} = await client.query(`
            SELECT *
            FROM picksix
            WHERE id=$1
            ORDER BY id;
        `, [pickId])

        return picksixPick;
    } catch (error) {
        throw error;
    }
}

async function getPicksixPicksByGameId(gameid) {
    try {
        const { rows: picksixPicks } = await client.query(`
            SELECT *
            FROM picksix
            WHERE gameid=$1
            ORDER BY id;
        `, [gameid])

        return picksixPicks
    } catch (error) {
        throw error;
    }
}

async function getPicksixPicksByGameIdAndType(gameid, type) {
    try {
        const { rows: picksixPicks } = await client.query(`
            SELECT *
            FROM picksix
            WHERE gameid=$1 AND type=$2
            ORDER BY id;
        `, [gameid, type])

        return picksixPicks;
    } catch (error) {
        throw error;
    }
}

async function getPicksixPicksByPickNumber(picknumber) {
    try {
        const { rows: picksixPicks } = await client.query(`
            SELECT *
            FROM picksix
            WHERE picknumber=$1
            ORDER BY id;
        `, [picknumber])

        return picksixPicks;
    } catch (error) {
        throw error;
    }
}

async function getPicksixPicksByPickNumberAndWeeklyId(picknumber, weeklyid) {
    try {
        const { rows: picksixPicks } = await client.query(`
            SELECT * 
            FROM picksix
            WHERE picknumber=$1 AND weeklyid=$2
            ORDER BY id;
        `, [picknumber, weeklyid])

        return picksixPicks;
    } catch (error) {
        throw error;
    }
}

async function updatePicksixPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ picksixPick ] } = await client.query(`
            UPDATE picksix
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return picksixPick;
    } catch (error) {
        throw error;
    }
}

async function addOutcomeToPicksixPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ picksixPick ] } = await client.query(`
            UPDATE picksix
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return picksixPick;
    } catch (error) {
        throw error;
    }
}

async function deletePicksix(pickId) {
    try {
       const { rows: [picksixPick] } = await client.query(`
            DELETE FROM picksix
            WHERE id=$1
       `, [pickId]) 

       return picksixPick;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createPicksixPick,
    getAllPicksixPicks,
    getPicksixPicksByWeeklyId,
    updatePicksixPick,
    addOutcomeToPicksixPick,
    getPicksixPickById,
    getPicksixPicksByGameId,
    getPicksixPicksByGameIdAndType,
    getPicksixPicksByPickNumber,
    getPicksixPicksByPickNumberAndWeeklyId,
    deletePicksix
}