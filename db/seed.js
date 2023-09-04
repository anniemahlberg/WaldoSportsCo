const client = require('./client');

const {
    createUser,
    updateUser,
    createGame,
} = require('./index');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
        DROP TABLE IF EXISTS picksix;
        DROP TABLE IF EXISTS posts;
        DROP TABLE IF EXISTS parlays;
        DROP TABLE IF EXISTS picks;
        DROP TABLE IF EXISTS weeklypicks;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS games;
        DROP TABLE IF EXISTS liopot;

    `);
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
        CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            firstname varchar(255) NOT NULL,
            lastname varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            venmo varchar(255) NOT NULL,
            admin BOOLEAN DEFAULT false,
            betscorrect INTEGER DEFAULT 0,
            totalbets INTEGER DEFAULT 0,
            lockscorrect INTEGER DEFAULT 0,
            totallocks INTEGER DEFAULT 0,
            parlayscorrect INTEGER DEFAULT 0,
            totalparlays INTEGER DEFAULT 0,
            totalpoints INTEGER DEFAULT 0,
            picksixcorrect INTEGER DEFAULT 0,
            totalpicksix INTEGER DEFAULT 0
        );
    `);

    await client.query(`
        CREATE TABLE games(
            id SERIAL PRIMARY KEY,
            hometeam varchar(255),
            awayteam varchar(255),
            level varchar(255),
            week INTEGER,
            date varchar(255),
            time varchar(255),
            duration varchar(255),
            primetime BOOLEAN,
            over BOOLEAN,
            under BOOLEAN,
            chalk BOOLEAN,
            dog BOOLEAN,
            totalpoints NUMERIC,
            favoredteam varchar(255),
            line NUMERIC,
            totalpointsoutcome varchar(255) DEFAULT 'tbd',
            lineoutcome varchar(255) DEFAULT 'tbd',
            active BOOLEAN DEFAULT true
        );
    `)

    await client.query(`
        CREATE TABLE weeklypicks(
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
            week INTEGER NOT NULL,
            active BOOLEAN DEFAULT true,
            betscorrect INTEGER DEFAULT 0,
            totalbets INTEGER DEFAULT 0,
            lockscorrect INTEGER DEFAULT 0,
            totallocks INTEGER DEFAULT 0,
            parlayscorrect INTEGER DEFAULT 0,
            totalparlays INTEGER DEFAULT 0,
            totalpoints INTEGER DEFAULT 0,
            picksixcorrect INTEGER DEFAULT 0,
            totalpicksix INTEGER DEFAULT 0
        );
    `)

    await client.query(`
        CREATE TABLE picks(
            id SERIAL PRIMARY KEY,
            weeklyid INTEGER REFERENCES weeklypicks(id) ON DELETE CASCADE,
            gameid INTEGER REFERENCES games(id) ON DELETE CASCADE,
            type VARCHAR(255) NOT NULL,
            bet VARCHAR(255) NOT NULL,
            text VARCHAR(255) NOT NULL,
            outcome VARCHAR(255) DEFAULT 'tbd',
            outcometext VARCHAR(255) DEFAULT 'tbd',
            lock BOOLEAN DEFAULT false,
            worth INTEGER DEFAULT 1,
            pointsawarded INTEGER DEFAULT 0,
            statsupdated BOOLEAN DEFAULT FALSE,
            UNIQUE (weeklyid, gameid, type)
        );
    `)

    await client.query(`
        CREATE TABLE parlays(
            id SERIAL PRIMARY KEY,
            weeklyid INTEGER REFERENCES weeklypicks(id) ON DELETE CASCADE,
            parlaynumber INTEGER DEFAULT 1, 
            gameid INTEGER REFERENCES games(id) ON DELETE CASCADE,
            type VARCHAR(255) NOT NULL,
            bet VARCHAR(255) NOT NULL,
            text VARCHAR(255) NOT NULL,
            outcome VARCHAR(255) DEFAULT 'tbd',
            outcometext VARCHAR(255) DEFAULT 'tbd',
            result VARCHAR(255) DEFAULT 'tbd',
            statsupdated BOOLEAN DEFAULT FALSE,
            UNIQUE (weeklyid, parlaynumber, gameid, type)
        );
    `)

    await client.query(`
        CREATE TABLE liopot(
            id SERIAL PRIMARY KEY,
            week INTEGER NOT NULL,
            amount INTEGER NOT NULL
        );
    `)

    await client.query(`
        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
            message VARCHAR(255) NOT NULL,
            time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            likes INTEGER DEFAULT 0,
            names VARCHAR(255)[]
        );
    `)
    
        await client.query(`
        CREATE TABLE picksix(
            id SERIAL PRIMARY KEY,
            weeklyid INTEGER REFERENCES weeklypicks(id) ON DELETE CASCADE,
            picknumber INTEGER DEFAULT 1, 
            gameid INTEGER REFERENCES games(id) ON DELETE CASCADE,
            type VARCHAR(255) NOT NULL,
            bet VARCHAR(255) NOT NULL,
            text VARCHAR(255) NOT NULL,
            outcome VARCHAR(255) DEFAULT 'tbd',
            outcometext VARCHAR(255) DEFAULT 'tbd',
            result VARCHAR(255) DEFAULT 'tbd',
            statsupdated BOOLEAN DEFAULT FALSE,
            UNIQUE (weeklyid, picknumber, gameid, type)
        );
    `);

    console.log('Finished building tables!')
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
            ADD COLUMN IF NOT EXISTS wins  INTEGER DEFAULT 0;

            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS currentwinner BOOLEAN DEFAULT FALSE;
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

    await createUser({username: 'StankyLines', password: 'SLObaby22!', firstname: 'Annie', lastname: 'Mahlberg', email: 'amahlberg4@gmail.com', venmo: 'AnnieMahlberg'})
    await updateUser(1, {admin: true})
} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());