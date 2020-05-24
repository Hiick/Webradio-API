require('dotenv').config();
const mySql = require('mysql');

let connection = null;

function query(queryString, callback){
    connection = mySql.createConnection({
        host: process.env.HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE
    })
    /*connection = mySql.createConnection({
        host: 'localhost',
        port: '8889',
        user: 'root',
        password: 'root',
        database: 'DBTest'
    })*/

    connection.query(queryString, function(error, results, fields){
        console.log('mySql: query: error is: ', error, ' and results are: ', results);

        callback(createDataResponseObject(error, results))
    })
}

function createDataResponseObject(error, results) {

    return {
        error: error,
        results: results === undefined ? null : results === null ? null : results
    }

}

module.exports = {

    query: query

};
