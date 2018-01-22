var express = require('express');
var format = require('pg-format');
var pgConfig = {
	client: 'postgresql',
    connectionString: process.env.DATABASE_URL || "postgres://postgres:eclipse@localhost:5432/hdb"
};


var dbcon = require('./src/db/dbcon');

var pgConnec = new dbcon(pgConfig);

console.log('pgConfig', pgConfig);

var contactRoute = require('./src/routes/contactroute');

var pgContactRoute = require('./src/routes/contactroute')(pgConnec);

var app = express();

var port = process.env.PORT || 5000;


app.use(express.static('public'));
//app.use(express.static('src/views'));

app.get('/', function(request, response) {
    response.render('index');
});

app.get('/Login', function(request, response) {

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

});

app.get('/Register', function(request, response) {
    response.send('Registration Page');
});

app.listen(port, function(err) {
    console.log('Running on port ' + port);
});


app.set('views', './src/views');
app.set('view engine', 'jade');


app.use('/contacts', pgContactRoute.router);
