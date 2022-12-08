const client = require('./client');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
        DROP TABLE IF EXISTS posts;
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
        CREATE TABLE posts(
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) REFERENCES users(username) ON UPDATE CASCADE ON DELETE CASCADE,
            message VARCHAR(255) NOT NULL,
            time TIMESTAMP,
            likes INTEGER DEFAULT 0
        );
    `);
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
} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());