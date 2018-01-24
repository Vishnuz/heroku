var express = require('express');
var authRouter = express.Router();
var passport = require('passport');

var router = function(dbcon){

	authRouter.route('/register')
	.get(function(req, res){
		res.render('register');
	});

	authRouter.route('/login')
	.get(function(req, res){
		res.render('login');
	});


	authRouter.route('/profile')
	.all(function(req, res, next){
		if(!req.user){
			res.redirect('/auth/login');
		}
		next();

	})
	.get(function(req, res){
        res.send( 'authenticated user --> ' + req.user.vishz__username__c);
	});


	authRouter.route('/login')
	.post(passport.authenticate('local',{
		failureRedirect: '/'
	}), function(req, res){
		console.log('Hello');
		res.redirect('/auth/profile');
	});


	authRouter.route('/register')
		.post(function(req, res) {

    	const { client, pool } = dbcon;

    pool.connect(function(err, client, done) {
        if (err) console.log(err);

        client = client;

        var colValues = [],
        	colNames = [],
        	indexes = [];

        Object.keys(req.body)
            .forEach(function(key, i) {
            		colNames.push('vishz__' + key + '__c');
                    colValues.push(req.body[key]);
                    indexes.push( '$' +  (i+1));
            });

    	var query = 'INSERT INTO salesforce.vishz__public_user__c( ' + colNames.join(', ') + ' )';
    	query += ' VALUES( '+ indexes.join(', ') +' )' ;
    	query += ' RETURNING *';

console.log('query', query);
        client.query(query, colValues, function(err, result) {
           /* if (err) { 
            	console.log(err); 
            	res.send(err); 
            }
            else { */
            	console.log('result1', result); 

		req.login(result.rows[0], function(){
			res.redirect('/auth/profile');
		});

            	//res.send(result); 
           // }
        });
	    })
	});

	return authRouter;
};

module.exports = router;