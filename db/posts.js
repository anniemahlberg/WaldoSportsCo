const client = require('./client')

async function createPost({username, message}) {
    try {
        const { rows: [ post ] } = await client.query(`
            INSERT INTO posts(username, message)
            VALUES ($1, $2)
            RETURNING *;
        `, [username, message])

        return post
    } catch (error) {
        throw error;
    }
}

async function getAllPosts() {
    try {
        const { rows: posts } = await client.query(`
            SELECT id, username, message, to_char(time, 'yyyy-MM-dd HH24:MI:SS.MS'), likes
            FROM posts
            ORDER BY id;
        `);
        
        return posts;
    } catch (error) {
        throw error;
    }
}

async function getAllPostsByUsername(username) {
    try {
        const { rows: posts } = await client.query(`
            SELECT *
            FROM posts
            WHERE username=$1
            ORDER BY id;
        `, [username])
        
        return posts;
    } catch(error) {
        throw error;
    }
}

async function getPostById(postId) {
    try {
        const { rows: [ post ]} = await client.query(`
            SELECT *
            FROM posts
            WHERE id=$1
            ORDER BY id;
        `, [postId])

        return post;
    } catch (error) {
        throw error;
    }
}

async function updatePost(id, fields = {}) {
    const keys = Object.keys(fields);
    const setString = keys.map(
        (key, index) => `"${key}"=$${index + 1}`
    ).join(', ');

    if (setString.length === 0) {
        return;
    }

    try {
        const { rows: [ post ] } = await client.query(`
            UPDATE posts
            SET ${setString}
            WHERE id=${id}
            RETURNING *
        `, Object.values(fields))

        return post;
    } catch (error) {
        throw error;
    }
}

async function likePost(postId) {
    try {
        const { rows: [ post ] } = await client.query(`
            UPDATE posts
            SET likes=likes+1
            WHERE id=$1
            RETURNING *
        `, [postId])

        return post;
    } catch (error) {
        throw error;
    }
}

async function deletePost(postId) {
    try {
       const { rows: [post] } = await client.query(`
            DELETE FROM posts
            WHERE id=$1
       `, [postId]) 

       return post;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    createPost,
    getAllPostsByUsername,
    getAllPosts,
    getPostById,
    updatePost,
    likePost,
    deletePost
}