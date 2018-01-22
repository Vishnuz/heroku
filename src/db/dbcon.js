var express = require('express');
//var format = require('pg-format')


function dbcon(config) {
	const { Pool, Client } = require('pg');

	this.pool = new Pool(config);
	this.client = new Client(config);
}


module.exports = dbcon;