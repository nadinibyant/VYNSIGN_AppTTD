var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const session = require('express-session');
var server = require('./routes/index');
// var usersRouter = require('./routes/users');
// var homeRouter = require('./routes/home')
// var managementRouter = require('./routes/management')
// var profileRouter = require('./routes/profile')

var app = express();
require("dotenv").config();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(session({
    secret: 'secret-key', // Ganti dengan kunci rahasia yang aman
    resave: false,
    saveUninitialized: true
}))
app.use(logger('dev'));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({
    extended: false
}));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'node_modules')));



app.use('/', server.user);
app.use('/', server.management);
app.use('/', server.sent);
app.use('/', server.request)
app.use('/', server.profile)
app.use('/', server.password)
// app.use('/users', usersRouter);
// app.use('/home', homeRouter);
// app.use('/management', managementRouter);
// app.use('/profile', profileRouter);
module.exports = app;