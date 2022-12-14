'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')


const { errorHandler } = require('./errors/error-handler');
const dbContext = require('./database/dbContext');
const pictureRouter = require('./pictures/picture-router');
const userRouter = require('./user/user-router');
const { authenticate, authRouter } = require('./auth/auth');

const app = express();
const port = 1309;
const hostname = 'localhost';

const dbConnectTimeout = 3000;

async function main() {
    // MongoDB setup
    dbContext(dbConnectTimeout);

    app.use(express.json());
    app.use(express.text());
    app.use(cookieParser())

   app.use('/api/auth',authRouter);
    app.use('/api/users', userRouter)
    app.use('/api/pictures', pictureRouter);
    
    app.use(errorHandler);
    
    // If the connection to mongoDB is not there, the server will not listen.
    mongoose.connection.once('open', () => {
        console.info('Connected to MongoDB');
        app.listen(port, hostname, () => {
            console.log(`Picture-API running on http://${hostname}:${port}`);
        });
    });
}

main();
