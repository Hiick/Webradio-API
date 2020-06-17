require('dotenv').config();
const mySql = require('mysql');

let connection = null;

connection = mySql.createConnection({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'DBTest'
})
/*connection = mySql.createConnection({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'DBTest'
})*/

connection.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL !");
});

function query(queryString, callback){
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
