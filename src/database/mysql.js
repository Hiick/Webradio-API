require('dotenv').config();
const mySql = require('mysql');

let connection = null;

function query(queryString, callback){
    function handleDisconnect() {
        connection = mySql.createConnection({
            host: process.env.HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        })

        connection.connect(function(err) {
            if(err) {
                console.log('Error when connecting to db:', err);
                setTimeout(handleDisconnect, 2000);
            }
        });

        connection.on('error', function(err) {
            console.log('db error', err);
            if(err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();
            } else {
                throw err;
            }
        });
    }

    handleDisconnect();

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
