const express = require('express');
var router = express.Router();

const createUser = require('../app/controller/http/user/create.js');
const authenticateUser = require('../app/controller/http/user/authenticate.js');
const validateEmail = require('../app/controller/http/user/validateEmail.js');
const generateVerificationToken = require('../app/controller/http/user/generateVerificationToken.js');
const requestPasswordChange = require('../app/controller/http/user/requestPasswordChange.js');
const passwordChangeValidate = require('../app/controller/http/user/passwordChangeValidate.js');
const passwordChange = require('../app/controller/http/user/passwordChange.js');
const requestPasswordReset = require('../app/controller/http/user/requestPasswordReset.js');

const setUser = require('../middleware/set_user.js');
const redirectOnLogin = require('../middleware/redirect_on_login.js');
const requiresSession = require('../middleware/requires_session.js');
const requiresVerified = require('../middleware/requires_verified.js');
const requiresSubscription = require('../middleware/requires_subscription.js');

router.get('/register', redirectOnLogin, (req, res, next) => {
	return res.render('user/register')
})


router.post('/register', redirectOnLogin, (req, res, next) => {
	createUser.execute(req, function(err, user){
		if(err){
			return next(err);
		}

		return res.redirect("/user/profile");
	});
})

router.get('/verify/:userId/:tokenId', (req, res, next) => {
	validateEmail.execute(req, function(err){
		if(err){
			return next(err);
		}

		return res.redirect('/');
	});
})

router.get('/verify/generate', requiresSession, (req, res, next) => {
	generateVerificationToken.execute(req, function(err){
		if(err){
			return next(err);
		}

		return res.redirect('/user/profile');
	});
})

router.get('/login', redirectOnLogin, (req, res, next) => {
	return res.render('user/login')
})

router.post('/login', redirectOnLogin, (req, res, next) => {
	authenticateUser.execute(req, function(err){
		if(err){
			return next(err);
		}

		return res.redirect('/user/profile');
	});
})

router.get('/logout', requiresSession, (req, res, next) => {
	req.session.destroy(function(err){
		if(err){
			return next(err);
		}else{
			return res.redirect('/');
		}
	});
})

router.get('/profile', setUser, (req, res, next) => {
	return res.render('user/user', {user: req.user, nowDate: new Date()});
})

router.get('/password/generate', [setUser, requiresVerified], (req, res, next) => {
	requestPasswordChange.execute(req, function(err){
		if(err){
			return next(err);
		}

		return res.send("Password change link sent to your email");
	});
})

router.get('/password/change/:userId/:token', (req, res, next) => {
	passwordChangeValidate.execute(req, function(err, user){
		if(err){
			return next(err);
		}

		return res.render('user/password_change', {user: user});
	});
})

router.post('/password/change/:userId/:token', (req, res, next) => {
	passwordChange.execute(req, function(err){
		if(err){
			return next(err);
		}

		return res.redirect('/');
	});
})

router.get('/password/reset', (req, res) => {
	res.render('user/password_reset');
})

router.post('/password/reset', (req, res, next) => {
	requestPasswordReset.execute(req, function(err){
		if(err){
			return next(err);
		}

		return res.send('Password reset link sent to your email');
	});
})

router.get('/test', [setUser, requiresSubscription], (req, res, next) => {
	return res.send("Hello, it worked!");
})

module.exports = router;
