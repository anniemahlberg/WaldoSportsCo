const client = require('./client')

async function createPicks({ username, picks, parlays }) {
    let outcomesArr = [];
    let parlaysOutcomesArr = [];
    
    if (picks) {
        const picksLength = picks.length;        
        for (let i = 0; i < picksLength; i++) {
            outcomesArr.push('');
        }
    }
    
    if (parlays) {
        const parlaysLength = parlays.length;        
        for (let i = 0; i < parlaysLength; i++) {
            parlaysOutcomesArr.push('');
        }
    }

    try {
        const { rows: [ pick ] } = await client.query(`
            INSERT INTO picks(username, picks, outcomes, parlays, "parlaysOutcomes")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `, [username, picks, outcomesArr, parlays, parlaysOutcomesArr]);
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
    createPicks,
    getAllPicks,
    getPicksByUsername,
    updatePicks,
    addOutcomesToPicks,
    getPickById
}