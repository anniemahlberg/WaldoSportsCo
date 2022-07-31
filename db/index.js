const { Client } = require('pg');

const client = new Client(process.env.DATABASE_URL || 'postgres://localhost:5432/waldosportsco');

async function createUser({ username, password, firstname, lastname, email, venmo }) {
    try {
        const { rows: [ user ] } = await client.query(`
            INSERT INTO users(username, password, firstname, lastname, email, venmo)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (username) DO NOTHING
            RETURNING *;
        `, [username, password, firstname, lastname, email, venmo]);
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

module.exports = {
    client,
    getAllUsers,
    createUser,
    updateUser,
    getUserById,
    getUserByUsername,
}