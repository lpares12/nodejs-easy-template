const express = require('express');
const nunjucks = require('nunjucks');
const sessions = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(sessions);

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
app.use((req, res, next) => {
	if(req.originalUrl === '/subscription/stripe/webhook'){
		next();
	}else{
		express.json()(req, res, next);
	}
});
app.use(express.urlencoded({ extended: true })); //for parsing application/x-www-form-urlencoded


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
db.on('close', () => { console.log(' lost DB connection'); });
db.on('reconnect', () => { console.log(' reconnected to DB'); });
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
	secret: "randomsecretkey", //TODO: This should be taken from a config file
	saveUninitialized: false,
	cookie: {maxAge: oneMonth},
	resave: false,
	store: store,
	unset: 'destroy',
}));


/////
// Set email
/////
emailer = require("./app/infrastructure/utils/emailer.js");
try{
	emailer.setUp();
}catch(error){
	console.log("Could not setup emailer: " + error);
}

/////
// Initialize stripe interface
/////
stripe = require("./app/infrastructure/utils/stripe.js");
stripe.setUp();

/////
// Load Routes
/////
var router = require('./routes/routes');
var userRouter = require('./routes/user');
var subscriptionRouter = require('./routes/subscription');
app.use('/', router);
app.use('/user', userRouter);
app.use('/subscription', subscriptionRouter);

/////
// Server start
/////

app.listen(5656, () => {
	console.log('Server started at http://localhost:5656');
})
