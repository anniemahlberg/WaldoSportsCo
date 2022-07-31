require('dotenv').config();
const { PORT = 3000 } = process.env;
const express = require('express');
const server = express();
const morgan = require('morgan');
const { client } = require('./db');
const apiRouter = require('./api');
const cors = require('cors');

const corsOptions = {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200
};

server.use(cors(corsOptions));
server.use(morgan('dev'));
server.use(express.json());
server.use('/api', apiRouter);

client.connect();
server.listen(PORT, () => {
    console.log('The server is up on port', PORT);
})
