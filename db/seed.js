const client = require('./client');

const {
    addPotAmount,
    editPotAmount,
    deletePotAmount
} = require('./index');

async function dropTables() {
try {
    console.log('Starting to drop tables...')
    await client.query(`
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
        CREATE TABLE liopot(
            id SERIAL PRIMARY KEY,
            week INTEGER NOT NULL,
            amount INTEGER NOT NULL
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
    const newPot = await addPotAmount(1, 260)
    console.log("pot:", newPot)

} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());