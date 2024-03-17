const bcrypt = require('bcrypt')
const client = require('./client')

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
        const { rows: users } = await client.query(
            `SELECT id, username, firstname, lastname, email, venmo, admin, betscorrect, totalbets, lockscorrect, totallocks, parlayscorrect, totalparlays, wins, currentwinner
            FROM users
            ORDER BY id;
            `);
        
        return users;
    } catch (error) {
        throw error;
    }
}

async function makeUserCurrentWinner(id) {
    try {
        const { rows: [ user ] } = await client.query(`
            UPDATE users
            SET currentwinner=TRUE, wins=wins+1
            WHERE id=$1
            RETURNING *;
        `, [id]);

        return user;
    } catch (error) {
        throw error;
    }
}

async function makeUserCurrentPickEmWinner(id) {
    try {
        const { rows: [ user ] } = await client.query(`
            UPDATE users
            SET currentpickemwinner=TRUE, pickemwins=pickemwins+1
            WHERE id=$1
            RETURNING *;
        `, [id]);

        return user;
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
            SELECT * 
            FROM users
            WHERE id=${ userId }
            ORDER BY id;
        `)
        
        return user;
    } catch (error) {
        throw error;
    }
}

async function getUserByUsername(username) {
    try {
        const { rows: [ user ] } = await client.query(`
            SELECT *
            FROM users
            WHERE username=$1
            ORDER BY id;
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    }
}

async function getAllUserStats() {
    try {
        const { rows: users } = await client.query(`
            SELECT username, betscorrect, totalbets, lockscorrect, totallocks, totalpoints, parlayscorrect, totalparlays, wins, currentwinner, totalcorrectpickem, totalpickem, totalpickempoints, pickemwins
            FROM users
            ORDER BY id;
        `)

        return users;
    } catch (error) {
        throw error;
    }
}

async function deleteUser(userId) {
    try {
        const { rows: [user] } = await client.query(`
            DELETE FROM users
            WHERE id=$1
        `, [userId]) 

       return user;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    getUserByUsername,
    makeUserCurrentWinner,
    makeUserCurrentPickEmWinner,
    updateUser,
    getAllUserStats,
    deleteUser
}