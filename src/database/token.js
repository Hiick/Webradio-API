let mySqlConnection;

module.exports = injectedMySqlConnection => {

    mySqlConnection = injectedMySqlConnection;

    return {
        saveAccessToken: saveAccessToken,
        getUserIDFromBearerToken: getUserIDFromBearerToken
    }

};

function saveAccessToken(accessToken, userID, callback) {
    const saveToken = `UPDATE users SET oauth_access_token = ${JSON.stringify(accessToken)} WHERE user_id = ${userID}`;

    mySqlConnection.query(saveToken, (dataResponseObject) => {
        callback(dataResponseObject.error)
    })
}

function getUserIDFromBearerToken(bearerToken, callback){

    const getUserIDQuery = `SELECT * FROM users WHERE oauth_access_token = '${bearerToken}';`

    mySqlConnection.query(getUserIDQuery, (dataResponseObject) => {

        const userID = dataResponseObject.results != null && dataResponseObject.results.length == 1 ?
            dataResponseObject.results[0].user_id : null;

        callback(userID)
    })
}
