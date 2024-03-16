const client = require('./client');

const {
} = require('./index');

async function dropTables() {
    try {
        console.log('Starting to drop tables...')
        console.log('Finished dropping tables!')
    } catch (error) {
        console.error('Error dropping tables!')
        throw error;
    }
}

async function createTables() {
    try {
        console.log('Starting to build tables...')
    await client.query(`
        CREATE TABLE pickem(
            id SERIAL PRIMARY KEY,
            weeklyid INTEGER REFERENCES weeklypicks(id) ON DELETE CASCADE,
            gameid INTEGER REFERENCES games(id) ON DELETE CASCADE,
            type VARCHAR(255) NOT NULL,
            bet VARCHAR(255) NOT NULL,
            text VARCHAR(255) NOT NULL,
            outcome VARCHAR(255) DEFAULT 'tbd',
            outcometext VARCHAR(255) DEFAULT 'tbd',
            worth INTEGER DEFAULT 1,
            pointsawarded INTEGER DEFAULT 0,
            statsupdated BOOLEAN DEFAULT FALSE,
            UNIQUE (weeklyid, gameid, type)
        );
    `)


        console.log('Finished building tables!!!!!')
    } catch (error) {
        console.error('Error building tables!')
        throw error;
    }
}

async function alterTables() {
    try {
        console.log('Starting to alter tables...')
        await client.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS totalpickem  INTEGER DEFAULT 0;

            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS totalcorrectpickem INTEGER DEFAULT 0;

            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS pickemwins  INTEGER DEFAULT 0;

            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS currentpickemwinner BOOLEAN DEFAULT FALSE;

            ALTER TABLE weeklypicks
            ADD COLUMN IF NOT EXISTS totalpickem  INTEGER DEFAULT 0;

            ALTER TABLE weeklypicks
            ADD COLUMN IF NOT EXISTS totalcorrectpickem INTEGER DEFAULT 0;

            ALTER TABLE weeklypicks
            ADD COLUMN IF NOT EXISTS pickemwins  INTEGER DEFAULT 0;

            ALTER TABLE weeklypicks
            ADD COLUMN IF NOT EXISTS currentpickemwinner BOOLEAN DEFAULT FALSE;
        `)
        console.log('Finished altering tables!')
    } catch (error) {
        console.error('Error altering tables!')
        throw error;
    }
}

async function rebuildDB() {
    try {
        client.connect();
        await dropTables();
        await createTables();
        await alterTables();
    } catch (error) {
        throw error;
    }
}

async function testDB() {
    try {
        console.log('STARTING DATABASE');
    } catch (error) {
        console.error("Error testing database!");
        throw error;
    }
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());