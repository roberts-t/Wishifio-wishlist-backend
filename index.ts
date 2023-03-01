require('dotenv').config();

import express, { Express } from 'express';
const app: Express = express();
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const port = process.env.PORT;
const routes = require('./src/routes/routes');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const fileUpload = require("express-fileupload");
const passport = require('passport');
const logger = require('./src/helpers/logger.helper');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true});
// const db = mongoose.connection;

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(fileUpload({
    limits: { fileSize: 4 * 1024 * 1024 }, // 4MB max for any file uploaded
    useTempFiles : false,
    tempFileDir : '/files/tmp/',
    safeFileNames: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    proxy: (process.env.NODE_ENV !== "DEV"),
    secret: process.env.SESSION_SECRET,
    resave: true,
    rolling: true,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
    }),
    cookie: {
        // 20 mins in ms
        maxAge: 20 * (60 * 1000),
        httpOnly: true,
        sameSite: true,
        secure: (process.env.NODE_ENV !== "DEV")
    }
}));

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize({}));
app.use(passport.session({}));

app.use('/api', routes);
app.use('/static', express.static('public'))

app.listen(port, () => {
    logger.info(`Server is running on PORT ${port}, ENV: ${process.env.NODE_ENV}`);
});