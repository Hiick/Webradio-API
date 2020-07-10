require('dotenv').config();
const mysql = require('mysql'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
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

const Radio = require('../models/radio'),
    Channel = require('../models/channel');

/**
 *
 * @returns {Promise<unknown>}
 */
const costAllUsers = async () => {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) as Nombre_utilisateurs FROM users`;

        pool.query(query, async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @returns {Promise<unknown>}
 */
const costAllSubscribers = async () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) 
        as Nombre_abonnés 
        FROM users
        WHERE subscribe = ?`;

        pool.query(query, ['true'], async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @returns {Promise<*|[]>}
 */
const costAllListen = async () => {
    let result = [];

    const channels = await Channel.find();
    const radios = await Radio.find();

    for (let i = 0; i < channels.length; i++) {
        if (!!channels[i].nbr_ecoute_global) {
            result.push(parseInt(channels[i].nbr_ecoute_global));
        }
    }

    for (let i = 0; i < radios.length; i++) {
        if (!!radios[i].nbr_ecoute_global) {
            result.push(parseInt(radios[i].nbr_ecoute_global));
        }
    }
    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

/**
 *
 * @returns {Promise<*|[]>}
 */
const costAllStreamsListen = async () => {
    let result = [];

    const channels = await Channel.find();

    for (let i = 0; i < channels.length; i++) {
        if (!!channels[i].nbr_ecoute_global) {
            result.push(parseInt(channels[i].nbr_ecoute_global));
        }
    }

    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

/**
 *
 * @returns {Promise<*|[]>}
 */
const costAllRadiosListen = async () => {
    let result = [];

    const radios = await Radio.find();

    for (let i = 0; i < radios.length; i++) {
        if (!!radios[i].nbr_ecoute_global) {
            result.push(parseInt(radios[i].nbr_ecoute_global));
        }
    }

    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

/**
 *
 * @returns {Promise<*>}
 */
const costAllActiveChannels = async () => {
    return Channel.find({ status: 'ACTIVE' }).countDocuments();
};

/**
 *
 * @returns {Promise<*>}
 */
const costAllRadios = async () => {
    return Radio.find().countDocuments();
};

/**
 *
 * @returns {Promise<*|[]>}
 */
const costAllCreatedStream = async () => {
    let result = [];

    const channels = await Channel.find();

    for (let i = 0; i < channels.length; i++) {
        if (!!channels[i].stream_cree) {
            result.push(parseInt(channels[i].stream_cree));
        }
    }

    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

/**
 *
 * @param id
 * @returns {Promise<String|StringConstructor|{message: string}>}
 */
const costAllCreatedStreamByUser = async (id) => {
    const created_stream = await Channel.findById({ _id: id });

    if (created_stream) {
        return created_stream.stream_cree;
    } else {
        return { message: 'No channel found' }
    }

};

/**
 *
 * @param id
 * @returns {Promise<{message: string}|number>}
 */
const costAllFavoriteForUser = async (id) => {
    const channel = await Channel.findById({ _id: id });

    if (channel) {
        return channel.Favoris.length;
    } else {
        return { message: 'No channel found' }
    }

};

/**
 *
 * @param id
 * @returns {Promise<{message: string}|number|Number|NumberConstructor>}
 */
const costAllListenForUser = async (id) => {
    const channel = await Channel.findById({ _id: id });

    if (channel) {
        return channel.nbr_ecoute_global
    } else {
        return { message: 'No channel found' }
    }
};

/**
 *
 * @param id
 * @returns {Promise<unknown>}
 */
const costAllSignalementsForUser = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_signalements
        FROM signalements
        WHERE channel_id = ?`;

        pool.query(query, [JSON.stringify(id)],(err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun signalement trouvé')
            }
            resolve(rows);
        });
    });
};

/**
 *
 * @returns {Promise<unknown>}
 */
const costAllSignalements = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_signalements
        FROM signalements
        `;

        pool.query(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun signalement trouvé')
            }
            resolve(rows)
        });

    });
};

/**
 *
 * @returns {Promise<unknown>}
 */
const costAllActiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_utilisateurs_actifs
        FROM users
        WHERE status = ?
        `;

        pool.query(query, ['ACTIVE'], (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows)
        });

    });
};

/**
 *
 * @returns {Promise<unknown>}
 */
const costAllInactiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_utilisateurs_inactifs
        FROM users
        WHERE status = ?
        `;

        pool.query(query, ['INACTIVE'], (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows)
        });

    });
};

/**
 *
 * @returns {Promise<*>}
 */
const costAllInactiveChannels = async () => {
    return await Channel.find({ status: 'INACTIVE' }).countDocuments();
};

/**
 *
 * @returns {Promise<*>}
 */
const costAllBanishChannels = async () => {
    return await Channel.find({ status: 'BANISH' }).countDocuments();
};

/**
 *
 * @param id
 * @returns {Promise<Number|NumberConstructor|{message: string}>}
 */
const costAllPlanStreamForUser = async (id) => {
    const channel = await Channel.findById({ _id: id });

    if (channel) {
        return channel.nbr_planification
    } else {
        return { message: 'No channel found' }
    }
};

/**
 *
 * @returns {Promise<{message: string}|*>}
 */
const costAllPlan = async () => {
    const channel = await Channel.find();

    if (channel) {
        return channel
    } else {
        return { message: 'No channel found' }
    }
};

module.exports = {
    costAllUsers: costAllUsers,
    costAllSubscribers: costAllSubscribers,
    costAllListen: costAllListen,
    costAllStreamsListen: costAllStreamsListen,
    costAllRadiosListen: costAllRadiosListen,
    costAllActiveChannels: costAllActiveChannels,
    costAllRadios: costAllRadios,
    costAllCreatedStream: costAllCreatedStream,
    costAllCreatedStreamByUser: costAllCreatedStreamByUser,
    costAllFavoriteForUser: costAllFavoriteForUser,
    costAllListenForUser: costAllListenForUser,
    costAllSignalementsForUser: costAllSignalementsForUser,
    costAllSignalements: costAllSignalements,
    costAllActiveUsers: costAllActiveUsers,
    costAllInactiveUsers: costAllInactiveUsers,
    costAllInactiveChannels: costAllInactiveChannels,
    costAllBanishChannels: costAllBanishChannels,
    costAllPlanStreamForUser: costAllPlanStreamForUser,
    costAllPlan: costAllPlan
};
