const client = require('./client')

async function createGame({ hometeam, awayteam, level, week, date, time, primetime, duration, over, under, chalk, dog, totalpoints, favoredteam, line }) {
    try {
        const { rows: [ game ] } = await client.query(`
            INSERT INTO games( hometeam, awayteam, level, week, date, time, primetime, duration, over, under, chalk, dog, totalpoints, favoredteam, line)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *;
        `, [ hometeam, awayteam, level, week, date, time, primetime, duration, over, under, chalk, dog, totalpoints, favoredteam, line]);
        return game;
    } catch (error) {
        throw error;
    }
}

async function getAllGames() {
    try {
        const { rows: games } = await client.query(`
            SELECT *
            FROM games
            ORDER BY id;
            `);
        
        return games;
    } catch (error) {
        throw error;
    }
}

async function getAllActiveGames() {
    try {
        const { rows: games } = await client.query(`
            SELECT *
            FROM games
            WHERE active=true
            ORDER BY id;
        `)

        return games;
    } catch (error) {
        
    }
}

async function getAllGamesByWeek(week) {
    try {
        const { rows: games } = await client.query(`
            SELECT *
            FROM games
            WHERE week=$1
            ORDER BY id;
        `, [week])

        return games;
    } catch (error) {
        
    }
}

async function updateGame(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ game ] } = await client.query(`
            UPDATE games
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return game;
    } catch (error) {
        throw error;
    }
}

async function getGameById(gameId) {
    try {
        const { rows: [ game ]} = await client.query(`
            SELECT *
            FROM games
            WHERE id=${ gameId }
            ORDER BY id;
        `)

        if (!game) {
            return null;
        } else {
            return game;
        }
    } catch (error) {
        throw error;
    }
}

async function deleteGame(gameId) {
    try {
        await client.query(`
            DELETE FROM picks
            WHERE gameid=$1;
        `, [gameId])

        await client.query(`
            DELETE FROM parlays
            WHERE gameid=$1
        `, [gameId])
        
        const { rows: [game] } = await client.query(`
            DELETE FROM games
            WHERE id=$1;
        `, [gameId]) 

        return game;
    } catch (error) {
        throw error
    }
}

module.exports = {
    createGame,
    getAllGames, 
    updateGame, 
    getGameById,
    getAllGamesByWeek,
    getAllActiveGames,
    deleteGame
}