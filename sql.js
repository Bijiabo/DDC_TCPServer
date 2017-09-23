/**
 * Created by huchunbo on 2017/4/29.
 */
const pg = require('pg');
const tableName = 'device_logs';
// create a config to configure both pooling behavior
// and client options
// note: all config is optional and the environment variables
// will be read if the config is not present
var config = {
    user: process.env.DATABASEUSER || 'postgres', //env var: PGUSER
    database: process.env.DATABASE || 'ddc', //env var: PGDATABASE
    password: process.env.PASSWORD || '', //env var: PGPASSWORD
    host: process.env.HOST || 'localhost', // Server hosting the postgres database
    port: process.env.DATABASEPORT || 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};

console.log(config);

//this initializes a connection pool
//it will keep idle connections open for 30 seconds
//and set a limit of maximum 10 idle clients
const pool = new pg.Pool(config);

pool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('idle client error', err.message, err.stack);
});

//export the query method for passing queries to the pool
module.exports.query = function (text, values, callback) {
    console.log('query:', text, values);
    return pool.query(text, values, callback);
};

// the pool also supports checking out a client for
// multiple operations, such as a transaction
module.exports.connect = function (callback) {
    return pool.connect(callback);
};

// ctrate table
module.exports.setupDB = function (callback) {
    var createTableStatement = `CREATE TABLE ${tableName}(
    id SERIAL PRIMARY KEY, 
    uuid VARCHAR(255) not null, 
    log text,
    mark BOOLEAN,
    created_at timestamp,
    updated_at timestamp
    )`;
    pool.query(createTableStatement, [], callback);
}

module.exports.tableName = tableName;