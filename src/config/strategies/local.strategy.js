var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;



module.exports = function(){


passport.use(new LocalStrategy({
		userNameField: 'username',
		passwordField: 'password'
	},
	function(username, password, done){

console.log('inpassport local', username, password);

		var pgConfig = {
		    client: 'postgresql',
		    connectionString: process.env.DATABASE_URL || "postgres://postgres:eclipse@localhost:5432/hdb"
		};

		var dbcon = require('../../db/dbcon');
		var pgConnec = new dbcon(pgConfig);
		var format = require('pg-format');

		const { client, pool } = pgConnec;

		pool.connect(function(err, client, connect_done) {
		    if (err) console.log(err)
		    client = client;
		    var query = format('SELECT * FROM salesforce.vishz__public_user__c WHERE vishz__username__c = %L AND vishz__password__c =%L %s', username, password, 'LIMIT 1');

		    client.query(query, function(err, result) {
		       

			console.log('result', result.rows[0]);
			var user = result.rows[0];
			connect_done();
		      if(result.rows[0] && result.rows[0].vishz__password__c == password){
		       	console.log('done');
		       	var user = result.rows[0];
		        	done(null, user);
		       }
		       else{
                    done(null, false, {message: 'Bad password'});
		       }
		    });
		});
	}));

};
