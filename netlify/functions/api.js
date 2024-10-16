//!--Requirements
const serverless = require('serverless-http');
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
//const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');


require('dotenv/config');

//!-- Middleware Functions
const isSignedIn = require('../../middleware/is-signed-in.js')
const passUserToView = require("../../middleware/pass-user-to-view.js")
const allowErrors = require('../../middleware/allow-errors.js')
const initFlashMessages = require('../../middleware/init-flash-messages.js')

//!--Routers/Controllers
const sparksRouter = require('../../controllers/sparks.js');
const authRouter = require('../../controllers/auth.js')

//!--Variables
const app = express()
const port = 3000

//!-- Middleware
app.use(morgan('dev'));
app.use(express.static('public')); //Check public folder on each request
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))

app.use(passUserToView);
app.use(allowErrors);
app.use(initFlashMessages);

//!--Routes
// -- Landing Page
app.get('/', (req, res) => {
    res.render('index.ejs')
});


//!-- Routers
app.use('/sparks', sparksRouter);
app.use('/auth', authRouter)

//!-- 404 
app.get('*', (req, res) => {
    return res.status(404).render('404.ejs')
})


//!--Server Connection
const startServers = async () => {
    try {
        //DB Connection
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Database connected ✅')

        //Server Connection
        
    } catch (error) {
        console.log(error)
    }
}

startServers()

module.exports.handler = serverless(app)