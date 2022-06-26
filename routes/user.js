const express = require('express');
var router = express.Router();

const requiresLogin = require('../middleware/requires_login.js');
const requiresSession = require('../middleware/requires_session.js');
const redirectOnLogin = require('../middleware/redirect_on_login.js');
const requiresUnverified = require('../middleware/requires_unverified.js');
const User = require('../models/user.js');
const Token = require('../models/token.js');

const Emailer = require('../email.js');

function sendVerificationEmail(user, token, host){
	var from = "fluento@fluento.es",
		to = user.email,
		subject = "Fluento verification email",
		url = "https://" + host + "/user/verify/" + user._id + "/" + token.token;

	Emailer.sendEmail(from, to, subject, url);
}

router.get('/login', redirectOnLogin, (req, res, next) => {
	return res.render('login')
})

router.post('/login', redirectOnLogin, (req, res, next) => {
	if(!req.body.user || !req.body.pass){
		var err = new Error("Fill in all the fields");
		err.status = 401;
		return next(err);
	}

	User.authenticate(req.body.user, req.body.pass, function(error, user){
		if(error || !user){
			var err = new Error("Wrong username or password");
			err.status = 401;
			return next(err);
		}else{
			user.lastLogin = new Date();
			//NOTE: We are gonna avoid validation when updating the user
			//because the validation for password will always fail, since
			//the password is now salted and hashed.
			//TODO: Explore if it is better to hardcode this validation
			//in the registration procedure, instead of in the model,
			//so we don't have to disable validation every time we update
			//the user.
			user.save({ validateBeforeSave: false });

			req.session.userId = user._id;
			return res.redirect('/user/profile');
		}
	});
})

router.get('/register', redirectOnLogin, (req, res, next) => {
	return res.render('register')
})

router.post('/register', redirectOnLogin, (req, res, next) => {
	var userData = {
		email: req.body.email,
		username: req.body.user,
		password: req.body.pass,
		password2: req.body.pass2,
		registrationDate: new Date(),
	}

	//Check passwords are matching
	if(userData['password'] != userData['password2']){
		var err = new Error('Passwords must match');
		err.status = 400;
		return next(err);
	}

	//TODO: Add register date to now to the user
	User.create(userData, async function(error, user){
		if(error){
			return next(error);
		}else{
			try{
				const token = await Token.generateToken(user);
				sendVerificationEmail(user, token, req.headers.host);

				req.session.userId = user._id;
			}catch(err){
				//TODO: Rollback user creation?
				return next(err);
			}

			return res.redirect("/user/profile");
		}
	});
})

router.get('/verify/:userId/:tokenId', (req, res, next) => {
	User.findById(req.params.userId).exec(async function(error, user){
		if(error || !user){
			var err = new Error("User not found");
			err.status = 401;
			return next(err);
		}

		try{
			const found = await Token.validateToken(user._id, req.params.tokenId);
			if(found){
				user.isVerified = true;
				user.save({ validateBeforeSave: false });
			}
		}catch(err){
			var e = new Error('Could not validate token');
			e.status = 400;
			return next(e);
		}

		return res.redirect('/user/login');
	});
})

router.get('/verify/generate', requiresSession, (req, res, next) => {
	User.findById(req.session.userId).exec(async function(error, user){
		if(error || !user){
			var err = new Error("Wrong session, remove your cookies and log in again");
			err.status = 401;
			return next(err);
		}else{
			//TODO: Shall we check the user is not already verified?

			try{
				await Token.clearUserTokens(user);
			}catch(error){
				console.log(error);
				var err = new Error('Could not clean old tokens');
				err.status = 400;
				return next(err);
			}

			try{
				const token = await Token.generateToken(user);
				sendVerificationEmail(user, token, req.headers.host);
			}catch(err){
				var err = new Error('Could not generate token');
				err.status = 400;
				return next(err);
			}

			return res.redirect('/user/profile');
		}
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

router.get('/profile', requiresSession, (req, res, next) => {
	User.findById(req.session.userId).exec(function(err, user){
		if(err){
			return next(err);
		}else{
			if(user == null){
				var err = new Error('Not authorized go back');
				err.status = 400;
				return next(err);
			}else{
				return res.render('user', {user: user})
			}
		}
	});
})

router.delete('/delete', requiresLogin, (req, res, next) => {
	User.findByIdAndRemove(req.session.userId).exec(function(err, user){
		if(err){
			return next(error);
		}

		if(!user){
			var err = new Error('User not found');
			err.status = 400;
			return next(err);
		}

		//If succeeded destroy session
		req.session.destroy(function(err){
			if(err){
				return next(err);
			}else{
				return res.redirect('/');
			}
		})
	});
})

module.exports = router;
