require('dotenv').config();
const { PORT = 4000 } = process.env;
const express = require('express');
const server = express();
const morgan = require('morgan');
const client = require('./db/client');
const apiRouter = require('./api');
const cors = require('cors');

server.use(morgan('dev'));
server.use(express.json());
server.use(cors());
server.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
server.use('/api', apiRouter);

client.connect();
server.listen(PORT, () => {
    console.log('The server is up on port', PORT);
})
