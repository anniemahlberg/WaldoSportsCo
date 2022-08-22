const client = require('./client');

const {
    createUser,
    updateUser,
    createGame,
    createPick,
    createWeeklyPick
} = require('./index');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
        DROP TABLE IF EXISTS picks;
        DROP TABLE IF EXISTS weeklypicks;
        DROP TABLE IF EXISTS users;
        DROP TABLE IF EXISTS games;
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
            admin BOOLEAN DEFAULT false
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
            value NUMERIC,
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
            username VARCHAR(255) REFERENCES users(username),
            week INTEGER NOT NULL,
            active BOOLEAN DEFAULT true
        );
    `)

    await client.query(`
        CREATE TABLE picks(
            id SERIAL PRIMARY KEY,
            weeklyid INTEGER REFERENCES weeklypicks(id),
            gameid INTEGER REFERENCES games(id),
            type VARCHAR(255) NOT NULL,
            bet VARCHAR(255) NOT NULL,
            text VARCHAR(255) NOT NULL,
            outcome VARCHAR(255) DEFAULT 'tbd'
        );
    `)

    console.log('Finished building tables!')
} catch (error) {
    console.error('Error building tables!')
    throw error;
}
}

async function rebuildDB() {
try {
    client.connect();
    await dropTables();
    await createTables();
} catch (error) {
    throw error;
}
}

async function testDB() {
try {
    console.log('STARTING DATABASE');

    await createUser({username: 'annie123', password: 'pass123', firstname: 'annie', lastname: 'mahl', email: 'annie@email.com', venmo: 'venmouser'})
    await createUser({username: 'nicktynick', password: 'pass123', firstname: 'nick', lastname: 'han', email: 'nick@email.com', venmo: 'venmouser2'})
    await updateUser(1, {venmo: 'venmo2', admin: true})
    await createGame({hometeam: "chiefs", awayteam: "raiders", level: "NFL", week:1,  date: "2022-08-10", time: "12:00", duration: "full-game", over: true, under: true, chalk: true, dog: true, totalpoints: 27.5, favoredteam: "home", line: 7.5, primetime: false, value: 1});
    await createGame({hometeam: "royals", awayteam: "yankees", level: "MLB", week:1, date: "2022-08-15", time: "19:00", duration: "full-game", over: true, under: true, chalk: false, dog: false, totalpoints: 5.5, favoredteam: "away", line: 0, primetime: true, value: 2});
    await createGame({hometeam: "sporting kc", awayteam: "austin fc", level: "MLS", week:1, date: "2022-08-21", time: "15:00", duration: "first-half", over: true, under: true, chalk: true, dog: true, totalpoints: 2.5, favoredteam: "home", line: 0.5, primetime: false, value: 1});

} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());