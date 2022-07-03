const express = require('express');
var router = express.Router();

const requiresLogin = require('../middleware/requires_login.js');
const requiresSession = require('../middleware/requires_session.js');
const redirectOnLogin = require('../middleware/redirect_on_login.js');
const requiresUnverified = require('../middleware/requires_unverified.js');
const User = require('../apps/user/user.js');

const Token = require('../models/token.js');

const Emailer = require('../email.js');

function sendVerificationEmail(user, token, host){
	var from = "fluento@fluento.es",
		to = user.email,
		subject = "Fluento email verification",
		url = "https://" + host + "/user/verify/" + user._id + "/" + token.token;

	Emailer.sendEmail(from, to, subject, url);
}

function sendPasswordChangeEmail(user, token, host){
	var from = "fluento@fluento.es",
		to = user.email,
		subject = "Fluento password change",
		url = "https://" + host + "/user/password/change/" + user._id + "/" + token.token;

	Emailer.sendEmail(from, to, subject, url);
}

function sendPasswordChangedEmail(user){
	var from = "fluento@fluento.es",
		to = user.email,
		subject = "Fluento password changed",
		text = "Password changed successfully";

	Emailer.sendEmail(from, to, subject, text);
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

	User.authenticateUser(req.body.user, req.body.pass, function(err, user){
		if(err){
			return next(err);
		}else{
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

	User.createUser(userData, async function(err, user){
		if(err){
			return next(err);
		}

		User.generateToken(user._id, "emailValidation", function(err, user, token){
			if(err){
				//TODO: Rollback user?
				return next(err);
			}

			try{
				sendVerificationEmail(user, token, req.headers.host);
				req.session.userId = user._id;
			}catch(err){
				//TODO: Rollback user?
				return next(err);
			}

			return res.redirect("/user/profile");
		});
	});
})

router.get('/verify/:userId/:tokenId', (req, res, next) => {
	User.validateToken(req.params.userId, req.params.tokenId, "emailValidation", function(err, user){
		if(err){
			return next(err);
		}

		return res.redirect('/');
	});
})

router.get('/verify/generate', requiresSession, (req, res, next) => {
	User.generateToken(req.session.userId, "emailValidation", function(err, user, token){
		if(err){
			next(err);
		}

		try{
			sendVerificationEmail(user, token, req.headers.host);
		}catch(err){
			next(err);
		}

		return res.redirect('/user/profile');
	});
})

router.get('/password/change/:userId/:tokenId', (req, res, next) => {
	User.checkToken(req.params.userId, req.params.tokenId, "passwordReset", function(err, user, token){
		if(err){
			next(err);
		}

		return res.render('password_change', {user: user});
	});
})

router.post('/password/change/:userId/:tokenId', (req, res, next) => {
	User.validateToken(req.params.userId, req.params.tokenId, "passwordReset", function(err, user){
		User.modifyPassword(user, req.body.pass, req.body.pass2, function(err, user){
			if(err){
				return next(err);
			}

			try{
				sendPasswordChangedEmail(user);
			}catch(err){
				return next(err);
			}

			return res.redirect('/');
		});
	});
})

router.get('/password/reset', (req, res) => {
	res.render('password_reset');
})

router.post('/password/reset', (req, res, next) => {
	User.resetPassword(req.body.username, function(err, user, token){
		if(err){
			return next(err);
		}

		try{
			sendPasswordChangeEmail(user, token, req.headers.host);
		}catch(err){
			return next(err);
		}

		return res.send('Password reset link sent to your email');
	});
})

router.get('/password/generate', requiresLogin, (req, res, next) => {
	User.generateToken(req.session.userId, "passwordReset", function(err, user, token){
		if(err){
			next(err);
		}

		try{
			sendPasswordChangeEmail(user, token, req.headers.host);
		}catch(err){
			next(err);
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

router.get('/profile', requiresSession, (req, res, next) => {
	User.getUser(req.session.userId, function(err, user){
		if(err){
			return next(err);
		}else{
			return res.render('user', {user: user});
		}
	});
})

router.delete('/delete', requiresLogin, (req, res, next) => {
	User.deleteUser(req.session.userId, function(err, user){
		if(err){
			return next(err);
		}else{
			//If succeeded destroy session
			req.session.destroy(function(err){
				if(err){
					return next(err);
				}else{
					return res.redirect('/');
				}
			})
		}
	});
})

module.exports = router;
