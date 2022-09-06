const client = require('./client')

async function createWeeklyPick({ username, week}) {
    try {
        const { rows: [ weeklypick ] } = await client.query(`
            INSERT INTO weeklypicks(username, week)
            VALUES ($1, $2)
            RETURNING *;
        `, [username, week])

        return weeklypick
    } catch (error) {
        throw error;
    }
}

async function createPick({ weeklyid, gameid, type, bet, text, lock, worth }) {
    try {
        const { rows: [ pick ] } = await client.query(`
            INSERT INTO picks(weeklyid, gameid, type, bet, text, lock, worth)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (weeklyid, gameid, type) DO NOTHING
            RETURNING *;
        `, [weeklyid, gameid, type, bet, text, lock, worth]);

        return pick;
    } catch (error) {
        throw error;
    }
}

async function getAllPicks() {
    try {
        const { rows: picks } = await client.query(`
            SELECT *
            FROM picks
            ORDER BY id;
        `);
        
        return picks;
    } catch (error) {
        throw error;
    }
}

async function getAllWeeklyPicks() {
    try {
        const { rows: weeklypicks } = await client.query(`
            SELECT *
            FROM weeklypicks
            ORDER BY id;
        `)

        return weeklypicks;
    } catch (error) {
        throw error;
    }
}

async function getAllActiveWeeklyPicks() {
    try {
        const { rows: weeklypicks } = await client.query(`
            SELECT *
            FROM weeklypicks
            WHERE active=true
            ORDER BY id;
        `)

        return weeklypicks;
    } catch (error) {
        throw error;
    }
}

async function getAllWeeklyPicksByWeek(week) {
    try {
        const { rows: weeklypicks } = await client.query(`
            SELECT *
            FROM weeklypicks
            WHERE week=$1
            ORDER BY id;
        `, [week])

        return weeklypicks
    } catch (error) {
        throw error;
    }
}

async function getAllActiveWeeklyPicksByWeek(week) {
    try {
       const { rows: weeklypicks } = await client.query(`
            SELECT *
            FROM weeklypicks
            WHERE week=$1 AND active=true
            ORDER BY id;
       `, [week])

       return weeklypicks
    } catch (error) {
        throw error;
    }
}

async function getPicksByWeeklyId(weeklyid) {
    try {
        const { rows: picks } = await client.query(`
            SELECT *
            FROM picks
            WHERE weeklyid=$1
            ORDER BY id;
        `, [weeklyid]);

        return picks;
    } catch (error) {
        throw error;
    }
}

async function getWeeklyPickByUsername(username) {
    try {
        const { rows: [pick] } = await client.query(`
            SELECT *
            FROM weeklypicks
            WHERE username=$1 AND active=true
            ORDER BY id;
        `, [username])
        
        return pick;
    } catch(error) {
        throw error;
    }
}

async function getAllWeeklyPicksByUsername(username) {
    try {
        const { rows: picks } = await client.query(`
            SELECT *
            FROM weeklypicks
            WHERE username=$1
            ORDER BY id;
        `, [username])
        
        return picks;
    } catch(error) {
        throw error;
    }
}

async function getPickById(pickId) {
    try {
        const { rows: [ pick ]} = await client.query(`
            SELECT *
            FROM picks
            WHERE id=$1
            ORDER BY id;
        `, [pickId])

        return pick;
    } catch (error) {
        throw error;
    }
}

async function getWeeklyPickById(weeklyid) {
    try {
        const { rows: [weeklypick] } = await client.query(`
            SELECT *
            FROM weeklypicks
            WHERE id=$1
            ORDER BY id;
        `, [weeklyid])

        return weeklypick
    } catch (error) {
        throw error;
    }
}

async function getPicksByGameId(gameid) {
    try {
        const { rows: picks } = await client.query(`
            SELECT *
            FROM picks
            WHERE gameid=$1
            ORDER BY id;
        `, [gameid])

        return picks
    } catch (error) {
        throw error;
    }
}

async function getPicksByGameIdAndType(gameid, type) {
    try {
        const { rows: picks } = await client.query(`
            SELECT *
            FROM picks
            WHERE gameid=$1 AND type=$2
            ORDER BY id;
        `, [gameid, type])

        return picks;
    } catch (error) {
        throw error;
    }
}

async function updateWeeklyPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ weeklypick ] } = await client.query(`
            UPDATE weeklypicks
            SET ${setString}
            WHERE id=${id}
            RETURNING *
        `, Object.values(fields))

        return weeklypick;
    } catch (error) {
        throw error;
    }
}

async function updatePick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ pick ] } = await client.query(`
            UPDATE picks
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return pick;
    } catch (error) {
        throw error;
    }
}

async function addOutcomeToPick(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ pick ] } = await client.query(`
            UPDATE picks
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return pick;
    } catch (error) {
        throw error;
    }
}

async function deletePick(pickId) {
    try {
       const { rows: [pick] } = await client.query(`
            DELETE FROM picks
            WHERE id=$1
       `, [pickId]) 

       return pick;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createWeeklyPick,
    createPick,
    getAllPicks,
    getAllActiveWeeklyPicks,
    getAllActiveWeeklyPicksByWeek,
    getAllWeeklyPicks,
    getAllWeeklyPicksByWeek,
    getPicksByWeeklyId,
    updatePick,
    updateWeeklyPick,
    addOutcomeToPick,
    getPickById,
    getWeeklyPickById,
    getWeeklyPickByUsername,
    getPicksByGameId,
    getPicksByGameIdAndType,
    deletePick,
    getAllWeeklyPicksByUsername
}