var express = require('express');
var format = require('pg-format')
const { Pool, Client } = require('pg');

var pgConfig = {
	client: 'postgresql',
    connectionString: process.env.DATABASE_URL || "postgres://postgres:eclipse@localhost:5432/hdb"
};

const client = new Client(pgConfig);

const pool = new Pool(pgConfig);

/*
client.connect();

client.query("INSERT INTO users(firstname, lastname) values($1,$2)", ["Vishnu","Vardhan"]);

client.query('SELECT firstname, lastname from users');
*/
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
        app.listen(3000, function() {
            console.log('listening on 3000')
        })
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


var dbRouter = express.Router();

dbRouter.route('/')
    .get(function(req, res) {

        pool.connect(function(err, client, done) {
            if (err) console.log(err)
           
           
            client = client;
            var query = format('SELECT * FROM salesforce.contact');
            client.query(query, function(err, result) {
                if (err) {
                    console.log("not able to get connection " + err);
                    res.status(400).send(err);
                }
                console.log(result.rows[0])


                var tableData = result.rows;
                var header = ['id', 'name', 'firstname', 'lastname', 'phone', 'email', 'sfid'];
                res.render('dbinfo', { table: tableData, header: header });

            });
        })
    });

app.use('/db', dbRouter);