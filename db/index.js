const { Client } = require('pg');
const bcrypt = require('bcrypt')

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/waldosportsco',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

async function createUser({ username, password, firstname, lastname, email, venmo }) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const { rows: [ user ] } = await client.query(`
            INSERT INTO users(username, password, firstname, lastname, email, venmo)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, hashedPassword, firstname, lastname, email, venmo]);
        return user;
    } catch (error) {
        throw error;
    }
}

async function getAllUsers() {
    try {
        const { rows } = await client.query(
            `SELECT id, username, firstname, lastname, email, venmo, active
            FROM users;
            `);
        
        return rows;
    } catch (error) {
        throw error;
    }
}

async function updateUser(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${ key }"=$${ index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ user ] } = await client.query(`
            UPDATE users
            SET ${ setString }
            WHERE id=${ id }
            RETURNING *;
        `, Object.values(fields));

        return user;
    } catch (error) {
        throw error;
    }
}

async function getUserById(userId) {
    try {
        const { rows: [ user ]} = await client.query(`
            SELECT id, username, firstname, lastname, email, venmo, active FROM users
            WHERE id=${ userId };
        `)

        if (!user) {
            return null;
        } else {
            return user;
        }
    } catch (error) {
        throw error;
    }
}

async function getUserByUsername(username) {
    try {
        const { rows: [ user ] } = await client.query(`
            SELECT *
            FROM users
            WHERE username=$1;
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    }
}

async function createGame({ hometeam, awayteam, level, date, time, primetime, value, duration, options, totalpoints, favoredteam, line }) {
    try {
        const { rows: [ game ] } = await client.query(`
            INSERT INTO games(hometeam, awayteam, level, date, time, primetime, value, duration, options, totalpoints, favoredteam, line)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *;
        `, [hometeam, awayteam, level, date, time, primetime, value, duration, options, totalpoints, favoredteam, line]);
        return game;
    } catch (error) {
        throw error;
    }
}

async function getAllGames() {
    try {
        const { rows } = await client.query(
            `SELECT *
            FROM games;
            `);
        
        return rows;
    } catch (error) {
        throw error;
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
            WHERE id=${ gameId };
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

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    getUserById,
    getUserByUsername,
    createGame,
    getAllGames,
    updateGame,
    getGameById
}