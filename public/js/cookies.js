function cookieExists(cookieName){
	cookies = document.cookie.split(';');
	for(i = 0; i < cookies.length; i+=1){
		if(cookies[i].split('=')[0].trim() == cookieName)
			return true;
	}
	return false;
}

function setCookie(cookieName, value){
	const d = new Date();
	//Set cookie for 1 year
	document.cookie = cookieName + '=' + value + ';max-age=' + 60*60*24*365 + '; path=/';
}

function getCookie(cookieName){
	cookies = document.cookie.split(';');
	for(i = 0; i < cookies.length; i+= 1){
		if(cookies[i].split('=')[0].trim() == cookieName){
			return cookies[i].split('=')[1].trim();
		}
	}

	return null;
}

class CookiesBanner{
	constructor(userFunction = null){
		this.cookieName = "consentCookie";
		this.bots = /bot|crawler|spider|crawling/i;
		this.executableFunction = userFunction;

		var isBot = this.bots.test(navigator.userAgent);

		if(isBot || this.hasConsent() === false){
			this.hideBanner();
			return;
		}else if(this.hasConsent() === true){
			if(this.executableFunction){
				this.executableFunction();
			}
			return;
		}

		this.showBanner();
	}
	
	hasConsent(){
		var cookieName = this.cookieName;
		var cookieValue = getCookie(cookieName);

		if(cookieValue == 'true'){
			return true;
		}else if(cookieValue == 'false'){
			return false;
		}

		return null;
	}

	showBanner(){
		var banner = document.getElementById('cookiesBanner');

		var rejectBtn = document.getElementById('rejectCookies');
		var acceptBtn = document.getElementById('acceptCookies');

		banner.style.display = 'block';

		var self = this;

		if(acceptBtn){
			acceptBtn.addEventListener('click', function(){
				self.hideBanner();
				self.setConsent(true);
				if(self.executableFunction){
					self.executableFunction();
				}
			});
		}

		if(rejectBtn){
			rejectBtn.addEventListener('click', function(){
				self.hideBanner();
				self.setConsent(false);
			});
		}
	}

	hideBanner(){
		var banner = document.getElementById('cookiesBanner');

		banner.style.display = 'none';		
	}

	setConsent(consent){
		setCookie(this.cookieName, consent)
	}
};
