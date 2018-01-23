var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;


module.exports = function(){

passport.use(new LocalStrategy({
		userNameField: 'usrename',
		passwordField: 'password'
	},
	function(username, password, done){

		var user = {
			username:usernamer,
			password:password
		};

		done(null, user);
	}));

}
