const client = require('./client');
const { makeUserCurrentWinner } = require('./users');

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
        console.log('Finished building tables!')
    } catch (error) {
        console.error('Error building tables!')
        throw error;
    }
}

async function alterTables() {
    try {
        console.log('Starting to alter tables...')
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