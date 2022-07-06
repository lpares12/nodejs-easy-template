const express = require('express');
var router = express.Router();

const redirectOnLogin = require('../middleware/redirect_on_login.js');

router.get('/', redirectOnLogin, (req, res) => {
	return res.render('index');
})

module.exports = router;
