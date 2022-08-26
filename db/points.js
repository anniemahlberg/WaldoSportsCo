const client = require("./client");

async function createPointValues({ pick, incorrectpick, lock, incorrectlock, primetime, incorrectprimetime, primetimelock, incorrectprimetimelock }) {
    try {
        const { rows: [ pointValue ] } = await client.query(`
            INSERT INTO points(pick, incorrectpick, lock, incorrectlock, primetime, incorrectprimetime, primetimelock, incorrectprimetimelock)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `, [pick, incorrectpick, lock, incorrectlock, primetime, incorrectprimetime, primetimelock, incorrectprimetimelock]);

        return pointValue;
    } catch (error) {
        throw error;
    }
}

async function getAllPoints() {
    try {
        const { rows: points } = await client.query(`
            SELECT *
            FROM points;
        `)

        return points;
    } catch (error) {
        throw error;
    }
}

async function updatePointValues(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ pointValue ] } = await client.query(`
            UPDATE points
            SET ${setString}
            WHERE id=${id}
            RETURNING *
        `, Object.values(fields))

        return pointValue;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllPoints,
    createPointValues,
    updatePointValues
}