var express = require('express');
var authRouter = express.Router();

var router = function(dbcon){

	authRouter.route('/register')
	.get(function(req, res){
		res.render('register');
	});

	authRouter.route('/login')
	.get(function(req, res){
		res.render('login');
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

        Object.keys(req.fields)
            .forEach(function(key, i) {
            		colNames.push('vishz__' + key + '__c');
                    colValues.push(req.fields[key]);
                    indexes.push( '$' +  (i+1));
            });

    	var query = 'INSERT INTO salesforce.vishz__public_user__c( ' + colNames.join(', ') + ' )';
    	query += ' VALUES( '+ indexes.join(', ') +' )' ;
    	query += ' RETURNING *';

        client.query(query, colValues, function(err, result) {
            if (err) { console.log(err); res.send(err); }
            else { console.log(result); res.send(result); }
        });
	    })
	});

	return authRouter;
};

module.exports = router;