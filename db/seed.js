const client = require('./client');
const { createPost, getAllPosts, updatePost, deletePost, likePost } = require('./posts');
const { getAllUsers } = require('./users');

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
            time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            likes INTEGER DEFAULT 0,
            names VARCHAR(255)[]
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

    const post1 = await createPost({username: 'StankyLines', message: 'This is my first post'});
    const post2 = await createPost({username: 'StankyLines', message: 'this is MY second post'});
    const allPosts = await getAllPosts();
    console.log("initial posts: ", allPosts)
    const updatePost1 = await updatePost(1, {message: 'Actually, I want it to say this'})
    const likePost1 = await likePost(1, 'Tpeter');
    const likePost1again = await likePost(1, 'Kyle');
    await likePost(2, 'Drew');
    await likePost(2, 'Nick');
    await likePost(2, 'Alyssa');
    const newPosts = await getAllPosts();
    console.log("new posts:", newPosts);
} catch (error) {
    console.error("Error testing database!");
    throw error;
}
}

rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());