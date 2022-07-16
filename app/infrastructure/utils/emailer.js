const nodemailer = require('nodemailer');

var Emailer = {
	APP_PROTOCOL: process.env.APP_PROTOCOL,
	APP_HOST: process.env.APP_HOST,

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

	sendEmail: function(to, subject, text, from=process.env.EMAIL){
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
	},

	sendVerificationEmail: async function(user, token){
		this.sendEmail(user.email, "Email verification",
			this.APP_PROTOCOL + "://" + this.APP_HOST + "/user/verify/" + user._id + "/" + token.token);
	},

	sendVerifiedEmail: async function(user){
		try{
			this.sendEmail(user.email, "Email verified", "Hello " + user.username + ", you have succesfuly verified your email");
		}catch(err){
			//Fail silently. Do not pass this error to the client, we don't care
			console.log(err);
		}
	},

	sendPasswordChangeEmail: async function(user, token){
		this.sendEmail(user.email, "Password change request",
			this.APP_PROTOCOL + "://" + this.APP_HOST + "/user/password/change/" + user._id + "/" + token.token);
	},

	sendPasswordChangedEmail: async function(user){
		this.sendEmail(user.email, "Password changed",
			user.username + " your password has been changed");
	},

	sendUpcomingInvoice: async function(name, email, invoiceData){
		try{
			this.sendEmail(invoiceData['email'], "Subscription invoice",
				name + " your subscription will be updated on " + invoiceData['date'] + " and you will be charged " + invoiceData['total'] + invoiceData['currency']);
		}catch(err){
			//Fail silently. Do not pass this error to the client, we don't care
			console.log(err);
		}
	},

	sendInvoice: async function(name, email, invoiceData){
		try{
			this.sendEmail(invoiceData['email'], "Subscription invoice",
				name + " your subscription has been updated on " + invoiceData['date'] + " and you have been charged " + invoiceData['total'] + invoiceData['currency']);
		}catch(err){
			//Fail silently. Do not pass this error to the client, we don't care
			console.log(err);
		}
	},

	sendInvoiceNotPaid: async function(name, email, invoiceData){
		try{
			this.sendEmail(invoiceData['email'], "Subscription renewal failed",
				name + " your subscription could not be updated because the payment failed on " + invoiceData['date'] + " for a total of " + invoiceData['total'] + invoiceData['currency'] + ". Make sure your card is not expired and you have enough funds for the transaction");
		}catch(err){
			//Fail silently. Do not pass this error to the client, we don't care
			console.log(err);
		}
	},

	sendContactEmail: async function(emailData){
		this.sendEmail(process.env.EMAIL, emailData['subject'],
			"Message by " + emailData['name'] + "(" + emailData['email'] + "):\n" + emailData['message']);
	},
}

module.exports = Emailer;
