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


var formidable = require('express-formidable')

app.use(formidable());

app.post('/saveData', function(req, res) {
 console.log(req.fields);

const { client, pool } = pgConnec;

var query = getQueryString(req.fields, 'salesforce.contact');

var colValues = Object.keys(req.fields).filter(function(key) {
	return req.fields[key];
});

console.log('before query');
console.log('before query', query);
client.query(query, colValues, function(err, result){
console.log('after query');

	if(err) res.send(JSON.stringify(err));
	else res.send(JSON.stringify(result));
});

});


function getQueryString(fieldData, sObject){

var query = ['UPDATE ' + sObject];
query.push('SET');

var set = [];
Object.keys(fieldData).forEach(function(key, i){
	set.push(key + ' =($' + (i+1) + ')');
});

query.push(set.join(', '));

query.push('WHERE id = ' + fieldData.id);

return query.join(' ');

}