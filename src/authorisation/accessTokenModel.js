let user;
let token;

module.exports =  (injectedUserDBHelper, injectedAccessTokensDBHelper) => {

    user = injectedUserDBHelper;
    token = injectedAccessTokensDBHelper;

    return  {
        getClient: getClient,
        saveAccessToken: saveAccessToken,
        getUser: getUser,
        grantTypeAllowed: grantTypeAllowed,
        getAccessToken: getAccessToken

    }

};

function getClient(clientID, clientSecret, callback){

    const client = {
        clientID,
        clientSecret,
        grants: null,
        redirectUris: null
    };

    callback(false, client);
}

function grantTypeAllowed(clientID, grantType, callback) {

    console.log('grantTypeAllowed called and clientID is: ', clientID, ' and grantType is: ', grantType);

    callback(false, true);
}


function getUser(email, password, callback){
    user.getUserFromCredentials(email, password, callback)
}

function saveAccessToken(accessToken, clientID, expires, user, callback){
    token.saveAccessToken(accessToken, user.user_id, callback)
}

function getAccessToken(bearerToken, callback) {
    token.getUserIDFromBearerToken(bearerToken, (userID) => {
        const accessToken = {
            user: {
                id: userID,
            },
            expires: null
        };

        callback(userID == null ? true : false, userID == null ? null : accessToken)
    })
}
