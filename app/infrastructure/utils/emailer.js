const nodemailer = require('nodemailer');

var Emailer = {
	setUp: function(){
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,
			auth: {
				user: process.env.EMAIL,
				pass: process.env.EMAIL_PASS
			}
		})
	},

	sendEmail: function(to, subject, text){
		message = {
			from: "email@email.com",
			to: to,
			subject: subject,
			text: text
		};

		this.transporter.sendMail(message, function(err, info){
			if(err){
				console.log("Email not sent: " + err);
			}else{
				console.log("Email sent");
			}
		})
	},

	sendVerificationEmail: async function(user, token, host){
		this.sendEmail(user.email, "Email verification",
			"https://" + host + "/user/verify/" + user._id + "/" + token.token);
	},

	sendVerifiedEmail: async function(user, host){
		this.sendEmail(user.email, "Email verified", "Hello " + user.username + ", you have succesfuly verified your email");
	},

	sendPasswordChangeEmail: async function(user, token, host){
		this.sendEmail(user.email, "Password change request",
			"https://" + host + "/user/password/change/" + user._id + "/" + token.token);
	},

	sendPasswordChangedEmail: async function(user, host){
		this.sendEmail(user.email, "Password changed",
			user.username + " your password has been changed");
	},
}

module.exports = Emailer;
