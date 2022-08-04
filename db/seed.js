const client = require('./client');

const {
    getAllUsers,
    createUser,
    updateUser,
    getUserById,
    createGame,
    getAllGames,
    updateGame,
    createPicks,
    getAllPicks,
    getPicksByUsername,
    updatePicks,
    addOutcomesToPicks
} = require('./index');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
        DROP TABLE IF EXISTS picks;
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
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username varchar(255) UNIQUE NOT NULL,
            password varchar(255) NOT NULL,
            firstname varchar(255) NOT NULL,
            lastname varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            venmo varchar(255) NOT NULL,
            active BOOLEAN DEFAULT true
        );
    `);

    await client.query(`
        CREATE TABLE games (
            id SERIAL PRIMARY KEY,
            hometeam varchar(255),
            awayteam varchar(255),
            level varchar(255),
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
        CREATE TABLE picks (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) REFERENCES users(username),
            picks VARCHAR(255) ARRAY,
            outcomes VARCHAR(255) ARRAY,
            parlays VARCHAR(255) [][],
            "parlaysOutcomes" VARCHAR(255) [][]
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

    await createGame({hometeam: "chiefs", awayteam: "raiders", level: "NFL", date: "2022-08-10", time: "12:00", duration: "full-game", over: true, under: true, chalk: true, dog: true, totalpoints: 27.5, favoredteam: "home", line: 7.5, primetime: false, value: 1});
    await createGame({hometeam: "royals", awayteam: "yankees", level: "MLB", date: "2022-08-15", time: "19:00", duration: "full-game", over: true, under: true, chalk: false, dog: false, totalpoints: 5.5, favoredteam: "away", line: 0, primetime: true, value: 2});
    await createGame({hometeam: "sporting kc", awayteam: "austin fc", level: "MLS", date: "2022-08-21", time: "15:00", duration: "first-half", over: true, under: true, chalk: true, dog: true, totalpoints: 2.5, favoredteam: "home", line: 0.5, primetime: false, value: 1});

    await createPicks({username: 'annie123', picks: ['raiders vs. chiefs over 27.5', 'austin fc +2.5'], parlays: [['chiefs -7.5', 'yankees vs. royals under 5.5'], ['austin fc +2.5', 'chiefs -7.5']]})
} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());