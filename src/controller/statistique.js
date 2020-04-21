require('dotenv').config();
const mysql = require('mysql'),
    crypto = require('crypto'),
    bcrypt = require('bcrypt'),
    mongoose = require('mongoose'),
    axios = require('axios');

let idUser;

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.PORT,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

const Radio = require('../models/radio'),
    Channel = require('../models/channel');

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

const costAllSubscribers = async () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) 
        as Nombre_abonnés 
        FROM users
        WHERE subscribe = true`;

        pool.query(query, async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

const costAllListen = async () => {
    let result = [];

    const channels = await Channel.find();
    const radios = await Radio.find();

    for (let i = 0; i < channels.length; i++) {
        if (!!channels[i].nbr_ecoute) {
            result.push(parseInt(channels[i].nbr_ecoute));
        }
    }

    for (let i = 0; i < radios.length; i++) {
        if (!!radios[i].nbr_ecoute) {
            result.push(parseInt(radios[i].nbr_ecoute));
        }
    }
    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

const costAllStreamsListen = async () => {
    let result = [];

    const channels = await Channel.find();

    for (let i = 0; i < channels.length; i++) {
        if (!!channels[i].nbr_ecoute) {
            result.push(parseInt(channels[i].nbr_ecoute));
        }
    }

    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

const costAllRadiosListen = async () => {
    let result = [];

    const radios = await Radio.find();

    for (let i = 0; i < radios.length; i++) {
        if (!!radios[i].nbr_ecoute) {
            result.push(parseInt(radios[i].nbr_ecoute));
        }
    }

    const arrSum = arr => arr.reduce((a,b) => a + b, 0);
    result = arrSum(result);

    return result
};

const costAllActiveChannels = async () => {
    return Channel.find({ status: 'ACTIVE' }).countDocuments();
};

const costAllRadios = async () => {
    return Radio.find().countDocuments();
};

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

const costAllCreatedStreamByUser = async (id) => {
    const created_stream = await Channel.findById({ _id: id });

    if (created_stream) {
        return created_stream.stream_cree;
    } else {
        return { message: 'No channel found' }
    }

};

const costAllFavoriteForUser = async (id) => {
    const channel = await Channel.findById({ _id: id });

    if (channel) {
        return channel.Favoris.length;
    } else {
        return { message: 'No channel found' }
    }

};

const costAllListenForUser = async (id) => {
    const channel = await Channel.findById({ _id: id });

    if (channel) {
        return channel.nbr_ecoute
    } else {
        return { message: 'No channel found' }
    }
};

const costAllSignalementsForUser = (id) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_signalements
        FROM signalements
        WHERE channel_id = ${JSON.stringify(id)}`;

        pool.query(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun signalement trouvé')
            }
            resolve(rows);
        });
    });
};

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

const costAllActiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_utilisateurs_actifs
        FROM users
        WHERE status = 'ACTIVE'
        `;

        pool.query(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows)
        });

    });
};

const costAllInactiveUsers = () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as Nombre_utilisateurs_inactifs
        FROM users
        WHERE status = 'INACTIVE'
        `;

        pool.query(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows)
        });

    });
};

const costAllInactiveChannels = async () => {
    return await Channel.find({ status: 'INACTIVE' }).countDocuments();
};

const costAllBanishChannels = async () => {
    return await Channel.find({ status: 'BANISH' }).countDocuments();
};

const costAllRegisteredThisMonth = async () => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) as nombre_inscrits_ce_mois 
        FROM users 
        WHERE created_at > CURRENT_DATE AND created_at < CURRENT_DATE + INTERVAL 1 MONTH
        `;

        pool.query(query, (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows)
        });

    });
};

const costAllPlanStreamForUser = async (id) => {
    const channel = await Channel.findById({ _id: id });

    if (channel) {
        return channel.nbr_planification
    } else {
        return { message: 'No channel found' }
    }
};

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
    costAllRegisteredThisMonth: costAllRegisteredThisMonth,
    costAllPlanStreamForUser: costAllPlanStreamForUser,
    costAllPlan: costAllPlan
};
