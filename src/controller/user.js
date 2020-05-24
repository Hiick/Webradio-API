require('dotenv').config();
const mysql = require('mysql'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    Channel = require('../models/channel'),
    mongoose = require('mongoose'),
    axios = require('axios');


let idUser;

const pool = mysql.createPool({
    host: process.env.HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});
/*const pool = mysql.createPool({
    host: 'localhost',
    port: '8889',
    user: 'root',
    password: 'root',
    database: 'DBTest'
});*/


module.exports = generateOAuth2Token = (id) => {
    return new Promise(async (resolve) => {
        const token = await new Promise(async (resolveToken) => {
            await crypto.randomBytes(256, async (ex, buffer) => {
                resolveToken(await crypto
                    .createHash('sha1')
                    .update(buffer)
                    .digest('hex'));
            })
        });

        resolve(new Promise((resolveToken, rejectToken) => {
                const query = "UPDATE users SET oauth_access_token = " + JSON.stringify(token) + " WHERE user_id = "+id;

                pool.query(query, (err, rows) => {
                    (err) ? rejectToken(err) : resolveToken(token);
                });
            }))
    });
};

const addChannelIdToNewUser = (user_id, channel_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET channel_id = '${channel_id}'
        WHERE user_id = ${user_id}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

const updateOneUser = (user) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        username = '${user.username}', 
        avatar = '${user.avatar}'
        WHERE user_id = ${user.user_id}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

const updateOneUserWithRole = (user) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        username = '${user.username}', 
        avatar = '${user.avatar}',
        role = '${user.avatar}'
        WHERE user_id = ${user.user_id}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

const userBack = (user, data) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(data.password, 10, (err, hash) => {
            const query = `
                UPDATE users
                SET
                username = '${data.username}',
                avatar = '${user[0].avatar}',
                password = '${hash}',
                status = 'ACTIVE',
                confirmed = true
                WHERE user_id = ${user[0].user_id}`;

            pool.query(query, async (err, rows) => {
                if (err) throw err;
                if (rows && rows.length === 0 || !rows) {
                    reject('Aucun utilisateur trouvé')
                }
                resolve(rows);
            });
        });
    });
};

const updateOneUserPassword = (user) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(user.password, 10, (err, hash) => {
            const query = `
               UPDATE users 
               SET 
               password = '${hash}'
               WHERE user_id = ${user.user_id}`;

            pool.query(query, async (err, rows) => {
                if (err) throw err;
                if (rows && rows.length === 0 || !rows) {
                    reject('Aucun utilisateur trouvé')
                }
                resolve(rows);
            });
        })
    });
};

const facebookUserLogin = async (token) => {
    return new Promise(async (resolve, reject) => {
        let getFacebookProfile = "https://graph.facebook.com/me?fields=birthday,email,hometown,name,picture.type(large)&access_token=" + token + "";

        await axios.get(getFacebookProfile).then(async (profile) => {
            if(process.env.USE_DATABASE){
                await pool.query("SELECT * FROM users WHERE facebook_user_id=" + profile.data.id, async (err, rows) => {
                    if(err) throw err;
                    if (rows && rows.length === 0) {
                        pool.query("" +
                            "INSERT into users(facebook_user_id,facebook_access_token,email,username,avatar,status,subscribe) " +
                            "VALUES('" + profile.data.id + "','" + token + "','" + profile.data.email + "','" + profile.data.name + "','" + profile.data.picture.data.url + "','ACTIVE', false)",
                            async (err, rows) => {
                                idUser = rows.insertId;
                                if(err) throw err;
                                let channel = {
                                    user_id: rows.insertId,
                                    channel_name: "",
                                    avatar: profile.data.picture.data.url,
                                    Flux: [{
                                        stream_url: "",
                                        first_source: {
                                            source_url: "",
                                            name: "",
                                            volume_source: ""
                                        },
                                        second_source: {
                                            source_url: "",
                                            name: "",
                                            volume_source: ""
                                        }
                                    }],
                                    Stream: [{
                                        _id: new mongoose.Types.ObjectId,
                                        volume_1: "",
                                        volume_2: "",
                                        direct_url: "",
                                        createdAt: new Date(),
                                    }],
                                    radio: false,
                                    status: "ACTIVE",
                                    live: false,
                                    createdAt: new Date()
                                };

                                const newChannel = Channel(channel);
                                newChannel.save((e) => {
                                    if (e) {
                                        throw new Error('Error with Facebook register');
                                    }
                                });
                                const oauth2_token = await generateOAuth2Token(rows.insertId);
                                resolve({
                                    message: "Registered",
                                    facebook: profile.data,
                                    oauth2_token: oauth2_token
                                })
                            });
                    } else {
                        const oauth2_token = await generateOAuth2Token(rows[0].user_id);
                        resolve({
                            message: "Connected",
                            facebook: profile.data,
                            oauth2_token: oauth2_token
                        })
                    }
                })
            }
        })
    });
};

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE user_id = ${id}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE email = ${JSON.stringify(email)}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
            }
            resolve(rows);
        });
    })
};

const getUserByResetPassword = (token) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE user_id = ${token.user_id} AND email = ${JSON.stringify(token.email)}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
            }
            resolve(rows);
        });
    })
};

const confirmUserEmail = (user) => {
    return new Promise((resolve, reject) => {
        const query = `
           UPDATE users 
           SET 
           confirmed = true
           WHERE user_id = ${user[0].user_id} AND email = ${JSON.stringify(user[0].email)}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
            }
            resolve(rows);
        });
    })
}

const updatePassword = (password, user) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            const query = `
            UPDATE users 
            SET 
            password = '${hash}'
            WHERE user_id = ${user[0].user_id} AND email = ${JSON.stringify(user[0].email)}`;

            pool.query(query, async (err, rows) => {
                if (err) throw err;
                if (rows && rows.length === 0 || !rows) {
                    reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
                }
                resolve(rows);
            });
        })
    })
};

const getUserWithOAuthToken = (token) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE oauth_access_token = ${JSON.stringify(token)}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

const getAllActiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE status = 'ACTIVE' AND status = 'ACTIVE '`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

const getAllInactiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE status = 'INACTIVE'`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur inactif trouvé')
            }
            resolve(rows);
        });
    })
};

const deleteUserById = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        DELETE FROM users
        WHERE user_id = ${id}`;

        const channel = await Channel.find({ user_id: id });

        pool.query(query, async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(channel);
        });
    });
};

const setInactiveUserById = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        status = 'INACTIVE'
        WHERE user_id = ${id}`;

        const channel = await Channel.find({ user_id: id });

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(channel);
        });
    });
};

const userCanStream = async (email, status, stripe_id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        subscribe = ${status},
        stripe_id = ${JSON.stringify(stripe_id)}
        WHERE email = ${JSON.stringify(email)}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(true);
        });
    });
}

const unsubscribeUser = async (user_id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        subscribe = false,
        WHERE user_id = ${user_id}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(true);
        });
    });
}

const generatePassword = (length) => {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&(§!-_';
    let charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const addNewUser = async (data) => {
    let base_avatar = "https://firebasestorage.googleapis.com/v0/b/webradio-stream.appspot.com/o/base_url.png?alt=media&token=a996c02e-ae13-40aa-b224-c2f4d703c606";

    return new Promise(async (resolve, reject) => {
        let password = generatePassword(8);

        bcrypt.hash(password, 10, (err, hash) => {
            const query = `
              INSERT INTO users (email, username, password, status, avatar, role, subscribe)
              VALUES ('${data.email}','${data.username}',
              '${hash}', 'ACTIVE', '${base_avatar}', 'ROLE_USER',false)`;

            pool.query(query, async (err, rows) => {
                if (err) throw err;
                resolve(password)
            });
        });
    });
}

module.exports = {
    generateOAuth2Token,
    userBack,
    addChannelIdToNewUser,
    updateOneUser,
    updateOneUserWithRole,
    updateOneUserPassword,
    facebookUserLogin,
    getAllUsers,
    getUserById,
    getUserByEmail,
    getUserWithOAuthToken,
    getAllActiveUsers,
    getAllInactiveUsers,
    deleteUserById,
    setInactiveUserById,
    getUserByResetPassword,
    updatePassword,
    userCanStream,
    unsubscribeUser,
    addNewUser,
    confirmUserEmail
};
