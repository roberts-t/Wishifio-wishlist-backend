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
const passport = require('passport');

mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URI, { useNewUrlParser: true});
const db = mongoose.connection;

app.use(express.json());

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200
}));

app.use(session({
    proxy: (process.env.NODE_ENV !== "DEV"),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URI,
    }),
    cookie: {
        // 30 mins in ms
        maxAge: 1800000,
        httpOnly: true,
        sameSite: true,
        secure: (process.env.NODE_ENV !== "DEV")
    }
}));

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(passport.initialize({}));
app.use(passport.session({}));

app.use('/api', routes);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});