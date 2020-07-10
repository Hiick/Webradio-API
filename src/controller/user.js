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

/**
 *
 * @type {function(*=): Promise<unknown>}
 */
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
                const query = "UPDATE users SET oauth_access_token = ? WHERE user_id = ?";

                pool.query(query, [JSON.stringify(token), id], (err, rows) => {
                    (err) ? rejectToken(err) : resolveToken(token);
                });
            }))
    });
};

/**
 *
 * @param user_id
 * @param channel_id
 * @returns {Promise<unknown>}
 */
const addChannelIdToNewUser = (user_id, channel_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET channel_id = ?
        WHERE user_id = ?`;

        pool.query(query, [channel_id, user_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @param user
 * @returns {Promise<unknown>}
 */
const updateOneUser = (user) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        username = ?, 
        avatar = ?
        WHERE user_id = ?`;

        pool.query(query, [user.username, user.avatar, user.user_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @param user
 * @returns {Promise<unknown>}
 */
const updateOneUserWithRole = (user) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        username = ?, 
        avatar = ?,
        role = ?
        WHERE user_id = ?`;

        pool.query(query, [user.username, user.avatar, user.avatar, user.user_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @param user
 * @param data
 * @returns {Promise<unknown>}
 */
const userBack = (user, data) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(data.password, 10, (err, hash) => {
            const query = `
                UPDATE users
                SET
                username = ?,
                avatar = ?,
                password = ?,
                status = ?,
                confirmed = ?
                WHERE user_id = ?`;

            pool.query(query, [data.username, user[0].avatar, hash, 'ACTIVE', true, user[0].user_id], async (err, rows) => {
                if (err) throw err;
                if (rows && rows.length === 0 || !rows) {
                    reject('Aucun utilisateur trouvé')
                }
                resolve(rows);
            });
        });
    });
};

/**
 *
 * @param user
 * @returns {Promise<unknown>}
 */
const updateOneUserPassword = (user) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(user.password, 10, (err, hash) => {
            const query = `
               UPDATE users 
               SET 
               password = ?
               WHERE user_id = ?`;

            pool.query(query, [hash, user.user_id], async (err, rows) => {
                if (err) throw err;
                if (rows && rows.length === 0 || !rows) {
                    reject('Aucun utilisateur trouvé')
                }
                resolve(rows);
            });
        })
    });
};

/**
 *
 * @param user
 * @returns {Promise<unknown>}
 */
const updateOneUserWithFacebook = (user) => {
    return new Promise((resolve, reject) => {
        console.log(user);

        const query = `
        UPDATE users 
        SET 
        facebook_user_id = ?,
        facebook_access_token = ?,
        email = ?,
        username = ?, 
        avatar = ?,
        status = ?,
        role = ?,
        subscribe = ?,
        confirmed = ?
        WHERE user_id = ?`;

        pool.query(query, [
            user.facebook_user_id,
            user.facebook_access_token,
            user.email,
            user.username,
            user.avatar,
            'ACTIVE',
            'ROLE_USER',
            false,
            true,
            user.user_id
        ], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @param token
 * @returns {Promise<unknown>}
 */
const facebookUserLogin = async (token) => {
    return new Promise(async (resolve, reject) => {
        let getFacebookProfile = "https://graph.facebook.com/me?fields=birthday,email,hometown,name,picture.type(large)&access_token=" + token + "";

        await axios.get(getFacebookProfile).then(async (profile) => {
            if(process.env.USE_DATABASE){
                await pool.query("SELECT * FROM users WHERE facebook_user_id=" + profile.data.id, async (err, rows) => {
                    if(err) throw err;
                    if (rows && rows.length === 0) {
                        try {
                            const userExistWithoutFacebook = await getUserByEmail(JSON.stringify(profile.data.email));

                            if (userExistWithoutFacebook) {
                                const updateUserCredentials = {
                                    facebook_user_id: profile.data.id,
                                    facebook_access_token: token,
                                    email: profile.data.email,
                                    username: profile.data.name,
                                    avatar: profile.data.picture.data.url,
                                    user_id: userExistWithoutFacebook[0].user_id
                                }

                                await updateOneUserWithFacebook(updateUserCredentials);
                                const oauth2_token = await generateOAuth2Token(userExistWithoutFacebook[0].user_id);

                                resolve({
                                    message: "L'utilisateur existait déjà et à donc été mis à jour",
                                    oauth2_token: oauth2_token
                                })
                            }
                        } catch (e) {
                            pool.query(
                                "INSERT into users(facebook_user_id,facebook_access_token,email,username,avatar,status,role,subscribe, confirmed) " +
                                "VALUES('" + profile.data.id + "','" + token + "','" + profile.data.email + "','" + profile.data.name + "','" + profile.data.picture.data.url + "','ACTIVE', 'ROLE_USER', false, true)",
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
                                    newChannel.save(async (e, result) => {
                                        try {
                                            await addChannelIdToNewUser(rows.insertId, result._id)
                                        } catch (e) {
                                            console.log(e);
                                        }

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
                        }
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
        }, (err) => {
          console.log(err);
        })
    });
};

/**
 *
 * @returns {Promise<unknown>}
 */
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

/**
 *
 * @param id
 * @returns {Promise<unknown>}
 */
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE user_id = ?`;

        pool.query(query, [id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

/**
 *
 * @param email
 * @returns {Promise<unknown>}
 */
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE email = ?`;

        pool.query(query, [email], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
            }
            resolve(rows);
        });
    })
};

/**
 *
 * @param token
 * @returns {Promise<unknown>}
 */
const getUserByResetPassword = (token) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE user_id = ? AND email = ?`;

        pool.query(query, [token.user_id, JSON.stringify(token.email)], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
            }
            resolve(rows);
        });
    })
};

/**
 *
 * @param user
 * @returns {Promise<unknown>}
 */
const confirmUserEmail = (user) => {
    return new Promise((resolve, reject) => {
        const query = `
           UPDATE users 
           SET 
           confirmed = true
           WHERE user_id = ? AND email = ?`;

        pool.query(query, [user[0].user_id, JSON.stringify(user[0].email)], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
            }
            resolve(rows);
        });
    })
}

/**
 *
 * @param password
 * @param user
 * @returns {Promise<unknown>}
 */
const updatePassword = (password, user) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, (err, hash) => {
            const query = `
            UPDATE users 
            SET 
            password = '?'
            WHERE user_id = ? AND email = ?`;

            pool.query(query, [hash, user[0].user_id, JSON.stringify(user[0].email)], async (err, rows) => {
                if (err) throw err;
                if (rows && rows.length === 0 || !rows) {
                    reject('Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !')
                }
                resolve(rows);
            });
        })
    })
};

/**
 *
 * @param token
 * @returns {Promise<unknown>}
 */
const getUserWithOAuthToken = (token) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE oauth_access_token = ?`;

        pool.query(query, [JSON.stringify(token)], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

/**
 *
 * @returns {Promise<unknown>}
 */
const getAllActiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE status = ? AND status = ?`;

        pool.query(query, ['ACTIVE', 'ACTIVE '], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    })
};

/**
 *
 * @returns {Promise<unknown>}
 */
const getAllInactiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT *
            FROM users
            WHERE status = ?`;

        pool.query(query, ['INACTIVE'], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur inactif trouvé')
            }
            resolve(rows);
        });
    })
};

/**
 *
 * @param id
 * @returns {Promise<unknown>}
 */
const deleteUserById = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        DELETE FROM users
        WHERE user_id = ?`;

        const channel = await Channel.find({ user_id: id });

        pool.query(query, [id], async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(channel);
        });
    });
};

/**
 *
 * @param id
 * @returns {Promise<unknown>}
 */
const setInactiveUserById = async (id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        status = ?
        WHERE user_id = ?`;

        const channel = await Channel.find({ user_id: id });

        pool.query(query, ['INACTIVE', id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(channel);
        });
    });
};

/**
 *
 * @param email
 * @param status
 * @param stripe_id
 * @returns {Promise<unknown>}
 */
const userCanStream = async (email, status, stripe_id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        subscribe = ?,
        stripe_id = ?
        WHERE email = ?`;

        pool.query(query, [status, JSON.stringify(stripe_id), JSON.stringify(email)], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(true);
        });
    });
}

/**
 *
 * @param user_id
 * @returns {Promise<unknown>}
 */
const unsubscribeUser = async (user_id) => {
    return new Promise(async (resolve, reject) => {
        const query = `
        UPDATE users 
        SET 
        subscribe = ?
        WHERE user_id = ?`;

        pool.query(query, [false, user_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }

            resolve(true);
        });
    });
}

/**
 *
 * @param length
 * @returns {string}
 */
const generatePassword = (length) => {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&(§!-_';
    let charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

/**
 *
 * @param data
 * @returns {Promise<unknown>}
 */
const addNewUser = async (data) => {
    let base_avatar = "https://firebasestorage.googleapis.com/v0/b/webradio-stream.appspot.com/o/base_url.png?alt=media&token=a996c02e-ae13-40aa-b224-c2f4d703c606";

    return new Promise(async (resolve, reject) => {
        let password = generatePassword(8);

        bcrypt.hash(password, 10, (err, hash) => {
            const query = `
              INSERT INTO users (email, username, password, status, avatar, role, subscribe, confirmed)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            pool.query(query, [data.email, data.username, hash, 'ACTIVE', base_avatar, 'ROLE_USER', false, false], async (err, rows) => {
                if (err) throw err;
                resolve(password)
            });
        });
    });
}

/**
 *
 * @param user_id
 * @param radio_id
 * @returns {Promise<unknown>}
 */
const addIntoFavorite = (user_id, radio_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO favoris_radios (id_user, id_radio)
              VALUES (?, ?)`;

        pool.query(query, [user_id, radio_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve('Radio ajoutée aux favoris !');
        });
    });
};

/**
 *
 * @param user_id
 * @param channel_id
 * @returns {Promise<unknown>}
 */
const addChannelIntoFavorite = (user_id, channel_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO favoris_channel (id_user, id_channel)
              VALUES (?, ?)`;

        pool.query(query, [user_id, channel_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve('Chaîne ajoutée aux favoris !');
        });
    });
};

/**
 *
 * @param user_id
 * @returns {Promise<unknown>}
 */
const getUserFavoriteRadios = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT favoris_radios.id_radio FROM favoris_radios WHERE id_user = ?`;

        pool.query(query, [user_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun favoris trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @param user_id
 * @returns {Promise<unknown>}
 */
const getUserFavoriteChannels = (user_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT favoris_channel.id_channel FROM favoris_channel WHERE id_user = ?`;

        pool.query(query, [user_id], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun favoris trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @param user_id
 * @param radio_id
 * @returns {Promise<unknown>}
 */
const deleteFavoriteRadioForUser = (user_id, radio_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        DELETE FROM favoris_radios WHERE favoris_radios.id_user = ? AND favoris_radios.id_radio = ?`;

        pool.query(query, [user_id, JSON.stringify(radio_id)], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun favoris trouvé')
            }
            resolve('Radio supprimée des favoris');
        });
    });
};

/**
 *
 * @param user_id
 * @param channel_id
 * @returns {Promise<unknown>}
 */
const deleteFavoriteChannelForUser = (user_id, channel_id) => {
    return new Promise((resolve, reject) => {
        const query = `
        DELETE FROM favoris_channel WHERE favoris_channel.id_user = ? AND favoris_channel.id_channel = ?`;

        pool.query(query, [user_id, JSON.stringify(channel_id)], async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun favoris trouvé')
            }
            resolve('Chaîne supprimée des favoris');
        });
    });
};

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
    confirmUserEmail,
    addIntoFavorite,
    getUserFavoriteRadios,
    deleteFavoriteRadioForUser,
    addChannelIntoFavorite,
    getUserFavoriteChannels,
    deleteFavoriteChannelForUser
};
