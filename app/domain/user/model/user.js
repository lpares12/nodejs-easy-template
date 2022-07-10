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
		validate: [ { validator: validateUsername, msg: 'Username should only contain alphanumeric characters'},
				{validator: validateIsNotTooLong, msg: 'Username should be maximum 30 characters'} ],
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

	//Plan information
	plan: {
		type: String,
		enum: ['none', 'basic'],
		default: 'none'
	},
	subscriptionEndDate: {
		type: Date,
		default: null,
	},
	stripeId: {
		type: String,
		default: null,
	},
	membershipCancelled: {
		type: Boolean,
		default: false,
	},
});

getHashedPassword = async function(password){
	return await bcrypt.hash(password, 10);
}

//Hash the password before saving and updating the database
UserSchema.pre('save', async function(next){
	user = this;

	//Avoid the password being hashed again if we are modifying other user fields
	//https://stackoverflow.com/questions/45372509/mongoose-changes-password-every-time-i-save-with-pre-save-hook
	if(user.isModified('password')){
		user.password = await getHashedPassword(user.password);	
	}
	return next();
});

UserSchema.pre('findOneAndUpdate', async function(next){
	//We need this hook also for when the password is changed using findByIdAndUpdate
	//Unfortunately, this hook doesn't give us easy access to the document, so we need
	//to make a hack.
	//https://stackoverflow.com/questions/72081894/how-to-update-bcrypt-password-with-prefindoneandupdate
	const update = this.getUpdate();
	if(update.password){
		hash = await getHashedPassword(update.password);
		this.setUpdate({$set: { password: hash }});
	}

	return next();
});

//Authenticate a client given username or email and pasword
UserSchema.statics.authenticate = async function(username, pass, callback){
	user = await User.findOne().or([{username: username},{email: username}])
		.orFail(new Error('Invalid username or password'));
	if(!await bcrypt.compare(pass, user.password)){
		return new Error('Invalid username or password');
	}

	return user;
}


const User = mongoose.model('User', UserSchema);
module.exports = User;
