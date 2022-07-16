const express = require('express');
var router = express.Router();

const contact = require('../app/controller/http/contact.js');

const redirectOnLogin = require('../middleware/redirect_on_login.js');

router.get('/', redirectOnLogin, (req, res) => {
	return res.render('index');
})

router.get('/contact', (req, res) => {
	return res.render('contact');
});

router.post('/contact', (req, res) => {
	contact.execute(req, function(err){
		if(err){
			return res.send("Could not send contact email: " + err);
		}

		return res.send("Message sent successfully. We will get back to you as soon as possible");
	});
	
})

module.exports = router;
