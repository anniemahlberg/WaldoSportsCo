const { client,
    getAllUsers,
    createUser,
    updateUser,
    getUserById,
} = require('./index');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
        DROP TABLE IF EXISTS users;
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

    console.log('Finished building tables!')
} catch (error) {
    console.error('Error building tables!')
    throw error;
}
}

async function createInitialUsers() {
try {
    console.log("Starting to create users...");
    await createUser({ username: 'annie123', password: 'pass123', firstname: 'annie', lastname: 'mahl', email: 'annie@email.com', venmo: 'venomuser' });
    await createUser({ username: 'tomtom123', password: 'pass123', firstname: 'tamba', lastname: 'mahl', email: 'tamba@email.com', venmo: 'venomuser' });
    await createUser({ username: 'avinosh', password: 'pass123', firstname: 'avi', lastname: 'mahl', email: 'avi@email.com', venmo: 'venomuser' });
    console.log("Finished creating users!");
} catch (error) {
    console.error("Error creating users!");
    throw error;
}
}

async function rebuildDB() {
try {
    client.connect();
    await dropTables();
    await createTables();
    await createInitialUsers();
} catch (error) {
    throw error;
}
}

async function testDB() {
try {
    console.log('STARTING DATABASE');

    console.log('GETTING USERS');
    const users = await getAllUsers();
    console.log("getAllUsers: ", users);
    console.log('Got users!');

} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());