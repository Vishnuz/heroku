var express = require('express');
var format = require('pg-format');
var formidable = require('express-formidable')

var passport = require('passport');
//var session = require('express-session');
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

var app = express();

app.set('views', './src/views');
app.set('view engine', 'jade');

//app.use(cookieParser());
//app.use(session({secret:'contacts'}));

//require('./src/config/passport')(app);


/*var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());

var session = require("express-session"),
    bodyParser = require("body-parser");

passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));
*/

var port = process.env.PORT || 5000;


app.use(express.static('public'));
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




app.use(formidable());

app.use('/contacts', pgContactRoute.router);
app.use('/auth', authRoute);


app.post('/Register', function(req, res) {

    const { client, pool } = pgConnec;

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


app.post('/saveData', function(req, res) {
    console.log(req.fields);

    const {
        client,
        pool
    } = pgConnec;

    pool.connect(function(err, client, done) {
        if (err) console.log(err)

        client = client;


        var query = getQueryString(req.fields, 'salesforce.contact');

        var colValues = [];

        Object.keys(req.fields)
            .forEach(function(key) {
                if (key != 'id')
                    colValues.push(req.fields[key]);
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