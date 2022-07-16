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

	sendUpcomingInvoice: async function(name, email, invoiceData){
		this.sendEmail(invoiceData['email'], "Subscription invoice",
			name + " your subscription will be updated on " + invoiceData['date'] + " and you will be charged " + invoiceData['total'] + invoiceData['currency']);
	},

	sendInvoice: async function(name, email, invoiceData){
		this.sendEmail(invoiceData['email'], "Subscription invoice",
			name + " your subscription has been updated on " + invoiceData['date'] + " and you have been charged " + invoiceData['total'] + invoiceData['currency']);
	},

	sendInvoiceNotPaid: async function(name, email, invoiceData){
		this.sendEmail(invoiceData['email'], "Subscription renewal failed",
			name + " your subscription could not be updated because the payment failed on " + invoiceData['date'] + " for a total of " + invoiceData['total'] + invoiceData['currency'] + ". Make sure your card is not expired and you have enough funds for the transaction");
	},

	sendContactEmail: async function(emailData){
		this.sendEmail(process.env.EMAIL, emailData['subject'],
			"Message by " + emailData['name'] + "(" + emailData['email'] + "):\n" + emailData['message']);
	},
}

module.exports = Emailer;
