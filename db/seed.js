const { client,
    getAllUsers,
    createUser,
    updateUser,
    getUserById,
    createGame,
    getAllGames,
    updateGame
} = require('./index');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
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
            options varchar(255),
            totalpoints NUMERIC,
            favoredteam varchar(255),
            line NUMERIC,
            totalpointsoutcome varchar(255) DEFAULT 'tbd',
            lineoutcome varchar(255) DEFAULT 'tbd',
            active BOOLEAN DEFAULT true
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

    console.log('GETTING USERS');
    const users = await getAllUsers();
    console.log("getAllUsers: ", users);
    console.log('Got users!');

    await createGame({hometeam: "chiefs", awayteam: "raiders", level: "NFL", date: "saturday", time: "12:00", duration: "full-game", options: ['over', 'under', 'chalk', 'dog'], totalpoints: 27.5, favoredteam: "chiefs", line: 7.5, primetime: false, value: 1});
    
    const games = await getAllGames();
    console.log("games: ", games)

} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());