require('dotenv').config();
const mysql = require('mysql'),
    { formatDate } = require('../utils/utils');

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
 * @TODO Penser à changer de la table user à channel
 * @param data
 * @returns {Promise<unknown>}
 */
const registerSignalement = (data) => {
    return new Promise(function(resolve, reject) {
        console.log(data.user_id)
        const query = `SELECT * FROM users WHERE user_id = '${data.user_id}'`;

        pool.query(query, async (err, rows) => {
            if(err) throw err;
            if (rows && rows.length === 0) {
                reject('Aucune chaîne n\'existe à cet ID. Veuillez vérifier');
            } else {
                const query = `
                INSERT INTO signalements
                (user_id,channel_name,url_stream,motif,channel_id,date_stream)
                VALUES
                ('${data.user_id}','${data.channel}','${data.url_stream}','${data.motif}','${data.channel_id}','${formatDate(data.date_stream)}')`;

                pool.query(query, async (err, rows) => {
                    if(err) throw err;
                    if (rows && rows.length === 0 || !rows) {
                        reject('Aucun signalement n\'est enregistré.');
                    }
                });
                resolve(rows[0].channel_id)
            }
        });
    });
};

const getAllSignalements = () => {
    return new Promise((resolve, reject) => {
       const query = 'SELECT channel_id,channel_name, COUNT(*) AS nombre_signalements FROM signalements GROUP BY channel_id, channel_name';

       pool.query(query, async (err, rows) => {
           if (err) throw err;
           if (rows && rows.length === 0 || !rows) {
               reject('Aucun signalements trouvé')
           }
           resolve(rows);
       });
    });
};

const getSignalementsByID = (data) => {
    return new Promise((resolve, reject) => {
       const query = `SELECT * FROM signalements WHERE channel_id = ${JSON.stringify(data.channel_id)}`;

       pool.query(query, async (err, rows) => {
           if (err) throw err;
           if (rows && rows.length === 0 || !rows) {
               reject('Aucun signalements trouvé')
           }
           resolve(rows);
       });
    });
};

const deleteSignalementByID = (data) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM signalements WHERE signalement_id = ${JSON.stringify(data.signalement_id)}`;

        pool.query(query, async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun signalements trouvé')
            }
            resolve(rows);
        });
    });
};

const updateSignalementByID = (data) => {
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE signalements
        SET
        motif = '${data.motif}'
        WHERE signalement_id = ${data.id}`;

        pool.query(query, async (err, rows) => {
            if (err) throw err;
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun utilisateur trouvé')
            }
            resolve(rows);
        });
    });
};

const banishChannelByID = (data) => {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM signalements WHERE channel_id = ${JSON.stringify(data.channel_id)}`;

        pool.query(query, async (err, rows) => {
            if (err) reject(err);
            if (rows && rows.length === 0 || !rows) {
                reject('Aucun signalements trouvé')
            }
            resolve(rows);
        });
    });
};

module.exports = {
    registerSignalement,
    getAllSignalements,
    getSignalementsByID,
    deleteSignalementByID,
    updateSignalementByID,
    banishChannelByID
};
