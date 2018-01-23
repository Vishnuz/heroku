module.exports = function(dbcon) {
    var module = {};
    var express = require('express');
	var format = require('pg-format');

    module.router = express.Router();

    const { client, pool } = dbcon;

    module.router.route('/')
        .get(function(req, res) {

            pool.connect(function(err, client, done) {
                if (err) console.log(err)

                client = client;
                var query = format('SELECT * FROM salesforce.contact ORDER BY id ASC Limit 100');
                client.query(query, function(err, result) {
                    if (err) {
                        console.log("not able to get connection " + err);
                        res.status(400).send(err);
                    }
                    console.log(result.rows[0])


                    tableData = result.rows;
                    var header = ['id', 'name', 'firstname', 'lastname', 'phone', 'email', 'sfid'];
                    res.render('table', { table: tableData, header: header });

                });
            })
        });


    module.router.route('/:recid')
        .get(function(req, res) {

            var id = req.params.recid,
                record;

            console.log('req.params', req.params);

            pool.connect(function(err, client, done) {
                if (err) console.log(err)

                client = client;
                var query = format('SELECT * FROM salesforce.contact WHERE id = %L %s', id, 'LIMIT 1');
                console.log('query', query);


                //  format('SELECT * FROM salesforce.contact ORDER BY id ASC Limit 1 where id = ');
                client.query(query, function(err, result) {
                    if (err) {
                        console.log("not able to get connection " + err);
                        res.status(400).send(err);
                    }
                    console.log(result)
                    var record = result.rows[0];
                    res.render('recordview', { record: record });

                });
            })
        });

    return module;
};