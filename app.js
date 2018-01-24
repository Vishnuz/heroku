var express = require('express');
var format = require('pg-format');
var formidable = require('express-formidable')
var bodyParser = require('body-parser');

var passport = require('passport');
var session = require('express-session');
var cookieParser = require('cookie-parser');



var pgConfig = {
    client: 'postgresql',
    connectionString: process.env.DATABASE_URL || "postgres://postgres:eclipse@localhost:5432/hdb"
};


var dbcon = require('./src/db/dbcon');

var pgConnec = new dbcon(pgConfig);

console.log('pgConfig', pgConfig);

var contactRoute = require('./src/routes/contactroute');
var authRoute = require('./src/routes/authroutes')(pgConnec);
var pgContactRoute = require('./src/routes/contactroute')(pgConnec);


var port = process.env.PORT || 5000;


var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
	secret:'trickyfrog',
	save:true,
    resave: true,
	saveUninitialized: true
}))
//app.use(formidable());
require('./src/config/passport')(app);

app.set('views', './src/views');
app.set('view engine', 'jade');


app.use('/contacts', pgContactRoute.router);
app.use('/auth', authRoute);



//app.use(express.static('src/views'));

app.get('/', function(request, response) {
    response.render('index');
});

app.get('/Login', function(req, res) {
/*
var bcrypt = require('bcryptjs');
*/
    res.render('login');
    /*
        pool.connect(function(err, client, done) {
            if (err) console.log(err)

            client = client;
            var query = format('SELECT * FROM salesforce.contact');
            client.query(query, function(err, result) {
                if (err) {
                    console.log(err)
                }
                console.log(result.rows[0])
            });
        })
    */
});

app.get('/Register', function(request, response) {
    response.render('register');
});

app.listen(port, function(err) {
    console.log('Running on port ' + port);
});






app.post('/Register', function(req, res) {

    const { client, pool } = pgConnec;

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

        client.query(query, colValues, function(err, result) {
            if (err) { console.log(err); res.send(err); }
            else { console.log(result); res.send(result); }
        });
    })
});


app.post('/saveData', function(req, res) {
    console.log(req.body);

    const {
        client,
        pool
    } = pgConnec;

    pool.connect(function(err, client, done) {
        if (err) console.log(err)

        client = client;


        var query = getQueryString(req.body, 'salesforce.contact');

        var colValues = [];

        Object.keys(req.body)
            .forEach(function(key) {
                if (key != 'id')
                    colValues.push(req.body[key]);
            });
        console.log('colValues', colValues);

        console.log('before query');
        console.log('before query', query);
        client.query(query, colValues, function(err, result) {
            console.log('err', err);
            console.log('result', result);

            if (err) res.send(JSON.stringify(err));
            else res.send(JSON.stringify(result));
        });


    })


});


function getQueryString(fieldData, sObject) {

    var query = ['UPDATE ' + sObject];
    query.push('SET');

    var set = [];
    Object.keys(fieldData).forEach(function(key, i) {
        if (key != 'id')
            set.push(key + ' =($' + (i + 1) + ')');
    });

    query.push(set.join(', '));

    query.push('WHERE id = ' + fieldData.id);

    return query.join(' ');

}