const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

var validatePassword = function(password){
	specialCharacters = "~!@#$%^&*_-+=|\(){}[]:;<>,.?/ ";

	var i, len;
	var hasNum = false, hasAlphaLow = false, hasAlphaUp = false, hasSpecial = false;

	for(i = 0, len = password.length; i < len; i++){
		var code = password.charCodeAt(i);

		if(code > 47 && code < 58){
			//Is numeric
			hasNum = true;
		}else if(code > 64 && code < 91){
			//Is upper case alpha
			hasAlphaUp = true;
		}else if(code > 96 && code < 123){
			//Is lower case alpha
			hasAlphaLow = true;
		}else if(specialCharacters.includes(password.charAt(i))){
			//Is special character
			hasSpecial = true;
		}else{
			//Other characters are not allowed
			return false;
		}
	}

	if(hasNum && hasAlphaLow && hasAlphaUp && hasSpecial){
		return true;
	}

	return false;
}

var validateUsername = function(username){
	//Make sure username contains alphanumeric values only
	if(username.match(/^[0-9a-z]+$/)){
		return true;
	}

	return false;
}

var validateIsNotTooLong = function(data){
	if(data.length > 30){
		return false;
	}
	return true;
}

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		validate: [ validator.isEmail, 'invalid email' ],
	},
	username: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		validate: [ validateUsername, 'Username should only contain alphanumeric characters' ],
	},
	password: {
		type: String,
		required: true,
		validate: [ { validator: validatePassword, msg: 'Password should contain alphanumeric characters and one special character' },
				{ validator: validateIsNotTooLong, msg: 'Password should not be longer than 30 characters' }],
	},
	registrationDate: {
		type: Date,
		required: true,
		default: Date.now,
	},
	lastLogin: {
		type: Date,
		required: false,
	},
	isVerified: {
		type: Boolean,
		required: true,
		default: false,
	},
});

//Hash the password before saving to the database
UserSchema.pre('save', function(next){
	//Avoid the password being hashed again if we are modifying other user fields
	//https://stackoverflow.com/questions/45372509/mongoose-changes-password-every-time-i-save-with-pre-save-hook
	if (!this.isModified('password')){
		return next();
	}

	var user = this;
	bcrypt.hash(user.password, 10, function(err, hash){
		if(err){
			return next(err);
		}
		user.password = hash;
		next();
	})
});

//Authenticate a client given username or email and pasword
UserSchema.statics.authenticate = function(username, pass, callback){
	User.findOne().or([{username: username},{email: username}])
	.exec(function(err, user){
		if(err){
			return callback(err);
		}else if(!user){
			var err = new Error('Wrong username or password');
			err.status = 401;
			return callback(err);
		}

		bcrypt.compare(pass, user.password, function (err, result) {
			if(result === true){
				return callback(null, user);
			}else{
				var err = new Error('Wrong username or password');
				err.status = 400;
				return callback(err);
			}
		})
	});
}


const User = mongoose.model('User', UserSchema);
module.exports = User;
