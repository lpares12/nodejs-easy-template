const express = require('express');
const nunjucks = require('nunjucks');
const sessions = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(sessions);
const cookieParser = require("cookie-parser");

const app = express();


/////
// Template engine
/////

//Set engine and extension
app.engine('html', nunjucks.render);
app.set('view engine', 'html');

//Configure nunjucks engine
nunjucks.configure('views', {
	autoescape: true,
	express: app
});


/////
// Parser
/////
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //for parsing application/x-www-form-urlencoded
app.use(cookieParser());


/////
// Static files configuration
/////
app.use(express.static(__dirname + '/public'));


/////
// Moongoose stuff
/////
var mongoose = require('mongoose');
var mongoDB = process.env.DATABASE_URL;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
var db = mongoose.connection;

//Handle connection error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
	console.log("Connected to DB");
});


/////
// Sessions configuration
/////
var store = new MongoDBStore({
	uri: mongoDB,
	collection: 'sessions',
});

store.on('error', function(error){
	console.log('Could not connect to MongoDB for sessions');
})

const oneMonth = 1000*60*60*24*30;
app.use(sessions({
	secret: "randomsecretkey", //This should be taken from a config file
	saveUninitialized: true,
	cookie: {maxAge: oneMonth},
	resave: false,
	store: store,
}));


/////
// Set email
/////
emailer = require("./email.js");
try{
	emailer.setUp();
}catch(error){
	console.log("Could not setup emailer: " + error);
}


/////
// Load Routes
/////
var router = require('./routes/routes');
var userRouter = require('./routes/user');
app.use('/', router);
app.use('/user', userRouter);


/////
// Server start
/////

app.listen(5656, () => {
	console.log('Server started at http://localhost:5656');
})
