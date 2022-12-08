const express = require('express');
const { createPost,
        getAllPostsByUsername,
        getAllPosts,
        getPostById,
        updatePost,
        likePost,
        deletePost
            } = require('../db');

const { requireUser } = require('./utils');
const postsRouter = express.Router();

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();

    res.send({
        posts
    });
});

postsRouter.get('/post/id/:postId', async (req, res) => {
    const { postId } = req.params;
    const post = await getPostById(postId);

    res.send({
        post
    });
});

postsRouter.get('/post/username/:username', async (req, res) => {
    const { username } = req.params;
    const posts = await getAllPostsByUsername(username);

    res.send({
        posts
    });
});

postsRouter.post('/addPost', requireUser, async (req, res, next) => {
    const { message } = req.body;
    const username = req.user.username

    try {
        if (username) {
            const post = await createPost({username, message});
            res.send({ message: 'you have added a new post!', post});
        } else {
            next({
                name: 'UnauthorizedUserError',
                message: 'You must be logged in to add a post'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
});

postsRouter.patch('/post/id/updatePost/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { message } = req.body;
    let updateFields = {}

    if (message) {
        updateFields.message = message;
    }
    
    try {
        const post = await getPostById(postId);
        if (post && post.username === req.user.username) {
            let updatedPost = await updatePost(postId, updateFields)
            res.send({ post: updatedPost });
        } else if (post && post.username !== req.user.username) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot edit a post that is not yours'
            })
        } else {
            next({
                name: 'PostNotFoundError',
                message: 'That post does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

postsRouter.patch('/post/id/likePost/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const username = req.user.username;
    
    try {
        const post = await getPostById(postId);
        if (post) {
            let likedPost = await likePost(postId, username)
            res.send({ post: likedPost });
        } else {
            next({
                name: 'PostNotFoundError',
                message: 'That post does not exist'
            });
        }
    } catch ({ name, message }) {
        next({ name, message });
    }
})

postsRouter.delete('/deletePost/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params
    const post = await getPostById(postId)

    try {
        if (post && post.username === req.user.username) {
            await deletePost(postId);
            res.send({message: 'You have deleted your post'})
        } else if (post && post.username !== req.user.username) {
            next({
                name: 'UnauthorizedUserError',
                message: 'You cannot delete a post that is not yours'
            })
        } else {
            next({
                name: 'PostNotFoundError',
                message: 'That post does not exist'
            });
        }
    } catch ({name, message}) {
        next({name, message})
    }
})

module.exports = postsRouter;