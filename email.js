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

	sendEmail: function(from, to, subject, text){
		message = {
			from: from,
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
	}
}

module.exports = Emailer;
