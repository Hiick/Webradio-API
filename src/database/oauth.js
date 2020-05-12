let mySqlConnection;
const bcrypt = require('bcrypt');

module.exports = injectedMySqlConnection => {
    mySqlConnection = injectedMySqlConnection;

    return {

        register: register,
        login: login,
        getUserFromCredentials: getUserFromCredentials,
        checkUserExist: checkUserExist

    }


};

function register(data, registrationCallback){
    let base_avatar = "https://firebasestorage.googleapis.com/v0/b/webradio-stream.appspot.com/o/base_url.png?alt=media&token=a996c02e-ae13-40aa-b224-c2f4d703c606";
    bcrypt.hash(data.password, 10, (err, hash) => {
        const registerUserQuery = `
              INSERT INTO users (email, username, password, status, avatar, role, subscribe)
              VALUES ('${data.email}','${data.username}',
              '${hash}', 'ACTIVE', '${base_avatar}', 'ROLE_USER',false)`;

        mySqlConnection.query(registerUserQuery, registrationCallback)
    });
}

const login = async (data, user, loginCallback) => {
    if (data.password && user[0].password) {
        const validPass = await bcrypt.compare(data.password, user[0].password);

        if (!validPass) {
            loginCallback({
                error: 'Email ou mot de passe incorrect'
            });
        } else {
            loginCallback({ error: null });
        }
    } else {
        loginCallback({ error: 'Aucun mot de passe n\'a été rentré' });
    }
};


function getUserFromCredentials(email, password, callback) {
    const getUserQuery = `SELECT * FROM users WHERE email = '${email}'`;

    mySqlConnection.query(getUserQuery, async (dataResponseObject) => {
        const hash = dataResponseObject.results[0].password;
        const validPassword = await bcrypt.compare(password, hash);
        if (validPassword) {
            callback(false, dataResponseObject.results !== null && dataResponseObject.results.length  === 1 ?  dataResponseObject.results[0] : null)
        } else {
            callback(false)
        }
    })
}

function checkUserExist(email, callback) {

    const query = `SELECT * FROM users WHERE email = '${email}'`;

    const sqlCallback = (dataResponseObject) => {
        const doesUserExist = dataResponseObject.results !== null ? dataResponseObject.results.length > 0 ? true : false : null

        callback(dataResponseObject.error, doesUserExist)
    };

    mySqlConnection.query(query, sqlCallback)
}



