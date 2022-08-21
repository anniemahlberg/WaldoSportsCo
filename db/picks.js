const client = require('./client')

async function createPick({ username, gameid, type, bet, text }) {
    try {
        const { rows: [ pick ] } = await client.query(`
            INSERT INTO picks(username, gameid, type, bet, text)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `, [username, gameid, type, bet, text]);
        return pick;
    } catch (error) {
        throw error;
    }
}

async function getAllPicks() {
    try {
        const { rows: picks } = await client.query(
            `SELECT *
            FROM picks;
            `);
        
        return picks;
    } catch (error) {
        throw error;
    }
}

async function getPicksByUsername(username) {
    try {
        const { rows: picks } = await client.query(`
            SELECT *
            FROM picks
            WHERE username=$1;
        `, [username]);

        return picks;
    } catch (error) {
        throw error;
    }
}

async function updatePicks(id, fields = {}) {
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

async function addOutcomesToPicks(id, fields = {}) {
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

async function getPickById(pickId) {
    try {
        const { rows: [ pick ]} = await client.query(`
            SELECT *
            FROM picks
            WHERE id=${ pickId };
        `)

        if (!pick) {
            return null;
        } else {
            return pick;
        }
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createPick,
    getAllPicks,
    getPicksByUsername,
    updatePicks,
    addOutcomesToPicks,
    getPickById
}