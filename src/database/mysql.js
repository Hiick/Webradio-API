require('dotenv').config();
const mySql = require('mysql');

let connection = null;

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

function handleDisconnect() {
    connection.connect((err) => {
        if (err) throw err;
        console.log("Connected to MySQL !");
    });                                   // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
    connection.on('error', (err) => {
        console.log('MySQL crash : ', err.code);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

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
