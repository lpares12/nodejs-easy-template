emailer = require('../infrastructure/utils/emailer.js');

module.exports = async function(commandData){
	//Send email
	emailer.sendContactEmail(commandData);
}
