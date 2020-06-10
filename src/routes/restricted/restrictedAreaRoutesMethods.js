const {
    registerSignalement,
    getAllSignalements,
    getSignalementsByID,
    deleteSignalementByID,
    updateSignalementByID,
    banishChannelByID
} = require('../../controller/signalements');

const {
    getAllChannels,
    getChannel,
    removeOneListener,
    updateChannelByID,
    getAllStreamChannels,
    deleteChannelByID,
    getAllBanishChannels,
    setInactiveChannelByID
} = require('../../controller/channel');

const {
    updateOneUser,
    updateOneUserWithRole,
    updateOneUserPassword,
    getAllUsers,
    getUserById,
    getAllActiveUsers,
    getAllInactiveUsers,
    deleteUserById,
    userCanStream,
    getUserWithOAuthToken,
    setInactiveUserById,
    unsubscribeUser,
    getUserByEmail,
    addNewUser,
    addChannelIdToNewUser
} = require('../../controller/user');

const {
    addNewRadio,
    getRadioByID,
    updateRadioByID,
    deleteRadioByID,
    removeOneRadioListener
} = require('../../controller/radio');

const {
    recordVoice,
    stopRecordVoice
} = require('../../controller/stream');

const {
    costAllUsers,
    costAllSubscribers,
    costAllListen,
    costAllStreamsListen,
    costAllRadiosListen,
    costAllActiveChannels,
    costAllRadios,
    costAllCreatedStream,
    costAllCreatedStreamByUser,
    costAllFavoriteForUser,
    costAllListenForUser,
    costAllSignalementsForUser,
    costAllSignalements,
    costAllActiveUsers,
    costAllInactiveUsers,
    costAllInactiveChannels,
    costAllBanishChannels,
    costAllPlanStreamForUser,
    costAllPlan
} = require('../../controller/statistique');

const { sendPasswordEmail } = require("../../controller/password");

const Channel = require('../../models/channel'),
    { validationResult } = require('express-validator'),
    STRIPE_API = require('../../controller/stripe'),
    axios = require('axios'),
    qs = require('querystring'),
    mongoose = require('mongoose'),
    TailingReadableStream = require('tailing-stream');

/**
 * SIGNALEMENTS METHODES
 */
const newSignalement = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let channel_id = req.params.id;

        Channel.findById(channel_id, async (err, channel) => {
            let signalement = {
                channel_id: channel_id,
                user_id: channel.user_id,
                channel: channel.channel_name,
                url_stream: channel.Stream[0].direct_url,
                date_stream: channel.Stream[0].createdAt,
                motif: req.body.motif
            };

            try {
                await registerSignalement(signalement);

                res.status(200).send({
                    success: true,
                    message: 'Le signalement à bien été envoyé',
                    signalement: signalement,
                });
            } catch (err) {
                res.status(400).send({
                    success: false,
                    message: err
                });
            }
        })
    }
};
const getSignalements = async (req, res) => {
    try {
        const signalements = await getAllSignalements();

        res.status(200).send({
            success: true,
            signalements,
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getSignalementsByChannelID = async (req, res) => {
    let signalement = {
        channel_id: req.params.id
    };

    try {
        const signalements = await getSignalementsByID(signalement);

        res.status(200).send({
            success: true,
            signalements,
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const deleteSignalement = async (req, res) => {
    let signalement = {
        signalement_id: req.params.id
    };

    try {
        await deleteSignalementByID(signalement);

        res.status(200).send({
            success: true,
            message: "Signalement supprimé avec succès !",
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const updateSignalement = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let data = {
            id: req.params.id,
            motif: req.body.motif
        };

        try {
            await updateSignalementByID(data);

            res.status(200).send({
                success: true,
                message: 'Signalement mis à jour',
                update: data
            })
        } catch (err) {
            res.status(400).send({
                success: false,
                err
            });
        }
    }
};
/**
 * END SIGNALEMENTS METHODES
 */

/**
 * CHANNELS METHODES
 */
const banishChannel = async (req, res) => {

    let channel = {
        channel_id: req.params.id
    };

    Channel.findById(channel, () => {

        try {
            banishChannelByID(channel).then(async () => {
                return await Channel.updateOne({ _id: req.params.id },{
                    $set: {
                        status: "BANISH"
                    }
                });
            });

            res.status(200).send({
                success: true,
                message: 'La chaîne est bannie. Ses signalements ont étés supprimés',
                banish: channel,
            });
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }

    })

};
const unbanChannel = async (req, res) => {
    let channel = {
        channel_id: req.params.id
    };

    Channel.findById(channel, () => {

        try {
            banishChannelByID(channel).then(async () => {
                return await Channel.updateOne({ _id: req.params.id },{
                    $set: {
                        status: "ACTIVE"
                    }
                });
            });

            res.status(200).send({
                success: true,
                message: 'La chaîne n\'est plus bannie.',
                banish: channel,
            });
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }

    })
};
const getChannels = async (req, res) => {
    try {
        const channels = await getAllChannels();

        res.status(200).send({
            success: true,
            channels
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getOneChannel = async (req, res) => {
    try {
        const channel = await getChannel(req.params.id);

        res.status(200).send({
            success: true,
            channel
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const removeChannelListener = async (req, res) => {
    try {
        const response = await removeOneListener(req.params.id);

        if (response) {
            res.status(200).send({success: false, response});
        } else {
            res.status(200).send({
                success: true,
                listener: -1
            });
        }
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const updateChannel = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let data = {
            channel_name: req.body.name,
            avatar: req.body.avatar,
        };

        try {
            await updateChannelByID(req.params.id, data);

            res.status(200).send({
                success: true,
                message: 'Chaîne mise à jour',
                update: data
            })
        } catch (err) {
            res.status(400).send({
                success: false,
                err
            });
        }
    }

};
const getStreamChannel = async (req, res) => {
    try {
        const channels = await getAllStreamChannels();

        res.status(200).send({
            success: true,
            channels
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const deleteChannel = async (req, res) => {
    try {
        await deleteChannelByID(req.params.id);

        res.status(200).send({
            success: true,
            message: 'Chaîne supprimée'
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getBanishChannels = async (req, res) => {
    try {
        let channels = await getAllBanishChannels();

        res.status(200).send({
            success: true,
            channels
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            err
        });
    }
};
/**
 * END CHANNELS METHODES
 */

/**
 * RADIOS METHODES
 */
const addRadio = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let radio = {
            radio_name: req.body.radio_name,
            logo: req.body.logo,
            direct_url: req.body.direct_url
        };

        try {
            let newRadio = await addNewRadio(radio);

            res.status(200).send({
                success: true,
                newRadio
            });
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }
    }
};
const removeRadioListener = async (req, res) => {
    try {
        const response = await removeOneRadioListener(req.params.id);

        if (response) {
            res.status(200).send({success: false, response});
        } else {
            res.status(200).send({
                success: true,
                listener: -1
            });
        }
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};

const getOneRadio = async (req, res) => {
    try {
        let radio = await getRadioByID(req.params.id);

        res.status(200).send({
            success: true,
            radio
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const updateOneRadio = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let newRadio = {
            radio_name: req.body.radio_name,
            logo: req.body.logo,
            direct_url: req.body.direct_url
        };

        try {
            let radio = await updateRadioByID(newRadio, req.params.id);

            if (radio) {
                res.status(200).send({
                    success: true,
                    message: 'Radio mise à jour avec succès !',
                    data: newRadio
                });
            }
        } catch (err) {
            res.status(400).send({
                success: false,
                message: 'La radio n\'existe pas'
            });
        }
    }
};
const deleteOneRadio = async (req, res) => {
    try {
        const deleted = await deleteRadioByID(req.params.id);

        if (deleted) {
            res.status(200).send({
                success: true,
                message: 'Radio supprimée'
            });
        }
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
/**
 * END RADIOS METHODES
 */

/**
 * USERS METHODES
 */
const updateUser = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let updateUser = {
            user_id: req.params.id,
            username: req.body.username,
            avatar: req.body.avatar
        };

        try {
            await updateOneUser(updateUser);

            res.status(200).send({
                success: true,
                message: 'Utilisateur mis à jour !'
            });
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }
    }
};
const updateUserWithRole = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let updateUser = {
            user_id: req.params.id,
            username: req.body.username,
            avatar: req.body.avatar,
            role: req.body.role
        };

        try {
            await updateOneUserWithRole(updateUser);

            res.status(200).send({
                success: true,
                message: 'Utilisateur mis à jour !'
            });
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }
    }
};
const updateUserPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let updateUser = {
            user_id: req.params.id,
            password: req.body.password
        };

        try {
            await updateOneUserPassword(updateUser);

            res.status(200).send({
                success: true,
                message: 'Mot de passe mis à jour !'
            });
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }
    }
};
const getUsers = async (req, res) => {
    try {
        const users = await getAllUsers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getOneUser = async (req, res) => {
    try {
        const user = await getUserById(req.params.id);

        res.status(200).send({
            success: true,
            user
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getUserWithOAuth = async (req, res) => {
    try {
        let token = req.headers.authorization;
        const [bearer, receivedToken] = token.split(" ");

        if (bearer !== "Bearer") {
            res.status(400).send('Unauthorized');
        }

        const user = await getUserWithOAuthToken(receivedToken);

        res.status(200).send({
            success: true,
            user
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getActiveUser = async (req, res) => {
    try {
        const users = await getAllActiveUsers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const getInactiveUser = async (req, res) => {
    try {
        const users = await getAllInactiveUsers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const deleteUser = async (req, res) => {
    try {
        const channel = await deleteUserById(req.params.id);
        await deleteChannelByID(channel[0]._id);

        res.status(200).send({
            success: true,
            message: "Utilisateur et sa chaîne supprimés avec succès !"
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const setInactiveUser = async (req, res) => {
    try {
        const channel = await setInactiveUserById(req.params.id);
        await setInactiveChannelByID(channel[0]._id);

        res.status(200).send({
            success: true,
            message: "Utilisateur et sa chaîne passés inactifs avec succès !"
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};

const addChannelIdToUser = async (user_id, channel_id) => {
    await addChannelIdToNewUser(user_id, channel_id);
};

const createNewUser = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let data = {
            email: req.body.email.toLowerCase(),
            username: req.body.username
        };

        try {
            const userExist = await getUserByEmail(JSON.stringify(data.email));

            if (userExist) {
                res.status(400).send({
                    success: false,
                    message: 'L\'utilisateur existe déjà'
                });
            }
        } catch (e) {
            let password = await addNewUser(data);
            const getUserId = await getUserByEmail(JSON.stringify(data.email));

            let channel = {
                user_id: getUserId[0].user_id,
                channel_name: req.body.username,
                avatar: "https://firebasestorage.googleapis.com/v0/b/webradio-stream.appspot.com/o/base_url.png?alt=media&token=a996c02e-ae13-40aa-b224-c2f4d703c606",
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
                    await addChannelIdToUser(getUserId[0].user_id, result._id);
                } catch (e) {
                    console.log(e);
                }

                if (e) {
                    res.status(401).send(e)
                }
            });

            await sendPasswordEmail(data.email, password);

            res.status(200).send({
                success: true,
                emailSent: true,
                message: "L'utilisateur à été ajouté avec succès ! Son mot de passe vient de lui être envoyé par mail"
            })
        }
    }
};
/**
 * END USERS METHODES
 */

/**
 * STREAM METHODES
 */
const getFirstStream = (req, res) => {
    let channel = req.params.channel_id;
    let radio = req.query.radio_id;

    res.set('content-type', 'audio/mp3');
    res.set('accept-ranges', 'bytes');
    try {
        const stream = TailingReadableStream.createReadStream("Stream/Stream_"+channel+"_"+radio+".mp3", { timeout: 0 });

        stream.on('data', buffer => {
            res.write(buffer)
        });
    } catch (e) {
        res.status(404).send({
            success: false,
            e
        });
    }
};
const recordStream = async (req, res) => {
    let channel = req.params.channel_id;
    let radio = req.query.radio_id;

    try {
        await recordVoice(channel, radio);

        res.status(200).send({
            success: true,
            message: 'Record : On'
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const stopStream = async (req, res) => {
    try {
        await stopRecordVoice();
        res.status(200).send({
            success: true,
            message: 'Record : Off'
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
// Don't forget to register stream
// Mixe 2 stream
// Diffuse mixed stream ?
/**
 * END STREAM METHODES
 */

/**
 * STATISTIQUES METHODES
 */
const costUsers = async (req, res) => {
    try {
        let users = await costAllUsers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costSubscribe = async (req, res) => {
    try {
        let users = await costAllSubscribers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costListen = async (req, res) => {
    try {
        let listen = await costAllListen();

        res.status(200).send({
            success: true,
            total_ecoute: listen
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costStreamsListen = async (req, res) => {
    try {
        let listen = await costAllStreamsListen();

        res.status(200).send({
            success: true,
            total_ecoute_stream: listen
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costRadiosListen = async (req, res) => {
    try {
        let listen = await costAllRadiosListen();

        res.status(200).send({
            success: true,
            total_ecoute_radios: listen
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costRadios = async (req, res) => {
    try {
        let radios = await costAllRadios();

        res.status(200).send({
            success: true,
            nombre_radios: radios
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costCreatedStream = async (req, res) => {
    try {
        let created_stream = await costAllCreatedStream();

        res.status(200).send({
            success: true,
            stream_crée: created_stream
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costCreatedStreamForUser = async (req, res) => {
    try {
        let created_stream = await costAllCreatedStreamByUser(req.params.id);

        res.status(200).send({
            success: true,
            stream_crée: created_stream
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costFavoriteForUser = async (req, res) => {
    try {
        let favoris = await costAllFavoriteForUser(req.params.id);

        res.status(200).send({
            success: true,
            favoris: favoris
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costListenForUser = async (req, res) => {
    try {
        let listen = await costAllListenForUser(req.params.id);

        res.status(200).send({
            success: true,
            nombre_ecoutes: listen
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costSignalementsForUser = async (req, res) => {
    try {
        let signalements = await costAllSignalementsForUser(req.params.channel_id);

        res.status(200).send({
            success: true,
            signalements
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costSignalements = async (req, res) => {
    try {
        let signalements = await costAllSignalements();

        res.status(200).send({
            success: true,
            signalements
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costActiveUsers = async (req, res) => {
    try {
        let users = await costAllActiveUsers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costInactiveUsers = async (req, res) => {
    try {
        let users = await costAllInactiveUsers();

        res.status(200).send({
            success: true,
            users
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costActiveChannels = async (req, res) => {
    try {
        let channels = await costAllActiveChannels();

        res.status(200).send({
            success: true,
            nombre_chaines_active: channels
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costInactiveChannels = async (req, res) => {
    try {
        let channels = await costAllInactiveChannels();

        res.status(200).send({
            success: true,
            nombre_chaines_inactive: channels
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costBanishChannels = async (req, res) => {
    try {
        let channels = await costAllBanishChannels();

        res.status(200).send({
            success: true,
            nombre_chaines_bannie: channels
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costPlanStreamForUser = async (req, res) => {
    try {
        let plan = await costAllPlanStreamForUser(req.params.id);

        res.status(200).send({
            success: true,
            nombre_plannification: plan
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
const costPlan = async (req, res) => {
    try {
        let plan = await costAllPlan();

        res.status(200).send({
            success: true,
            nombre_plannification: plan
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
/**
 * END STATISTIQUES METHODES
 */

/**
 * STRIPE METHODES
 */
const getAllSubscriptions = async (req, res) => {
    res.status(200).send(await STRIPE_API.getProductsAndPlans());
}

const checkIfUserIsSubscribe = async (req, res) => {
    const subscribe = await getUserById(req.params.user_id);

    if (!subscribe[0].stripe_id) {
        res.status(400).send({
            success: false,
            message: "L'utilisateur n'est pas abonné"
        })
    } else {
        let config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Bearer " + process.env.STRIPE_API_KEY,
            }
        }

        let url = 'https://api.stripe.com/v1/customers/'+subscribe[0].stripe_id;

        await axios.get(url, config).then(async (response) => {
            if (response.data.subscriptions.data[0].status === 'active') {
                res.status(200).send({
                    success: true,
                    message: "L'utilisateur est toujours abonné"
                })
            } else {
                await unsubscribeUser(req.params.user_id);

                res.status(400).send({
                    success: true,
                    message: "L'utilisateur n'est plus abonné"
                })
            }
        })
    }
}

const doPayment = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        let parsedPlan = JSON.parse(req.body.plan);

        let config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': "Bearer " + process.env.STRIPE_API_KEY,
            }
        }

        try {
            const user = await getUserByEmail(req.body.email.toLowerCase());

            let card = {
                type: 'card',
                'card[number]': req.body.card_number,
                'card[exp_month]': req.body.card_exp_month,
                'card[exp_year]': '20' + req.body.card_exp_year,
                'card[cvc]': req.body.card_cvc
            }

            await axios.post('https://api.stripe.com/v1/payment_methods', qs.stringify(card), config).then(async (response) => {
                let paymentMethodId = response.data.id

                let payment = {
                    email: req.body.email.toLowerCase(),
                    planId: parsedPlan.id,
                    paymentMethodId: paymentMethodId
                }

                try {
                    const subscription = await STRIPE_API.createCustomerAndSubscription(payment);

                    if (subscription.plan.active) {
                        const subscribe = await userCanStream(payment.email, subscription.plan.active, subscription.customer);
                        if (subscribe) {
                            await STRIPE_API.sendConfirmPaymentEmail(payment.email, user);

                            res.status(200).send({
                                success: true,
                                message: "L'utilisateur : " + payment.email + ' peut désormais streamer !',
                                emailSent: true
                            });
                        }
                    } else {
                        res.status(400).send({
                            success: false,
                            error: 'Paiement accepté mais plan inactif'
                        });
                    }
                } catch (e) {
                    res.status(400).send({
                        success: false,
                        error: 'Paiement refusé'
                    });
                }
            })
        } catch (e) {
            res.status(400).send({
                success: false,
                error: "L'email reçu ne correspond à aucun utilisateur connu chez nous."
            });
        }
    }
}

/**
 * END STRIPE METHODES
 */

module.exports = {
    newSignalement: newSignalement,
    getSignalements: getSignalements,
    getSignalementsByChannelID: getSignalementsByChannelID,
    deleteSignalement: deleteSignalement,
    updateSignalement: updateSignalement,

    banishChannel: banishChannel,
    unbanChannel: unbanChannel,
    getChannels: getChannels,
    removeChannelListener: removeChannelListener,
    getOneChannel: getOneChannel,
    updateChannel: updateChannel,
    getStreamChannel: getStreamChannel,
    deleteChannel: deleteChannel,
    getBanishChannels: getBanishChannels,

    addRadio: addRadio,
    getOneRadio:getOneRadio,
    removeRadioListener: removeRadioListener,
    updateOneRadio: updateOneRadio,
    deleteOneRadio: deleteOneRadio,

    updateUser: updateUser,
    updateUserWithRole: updateUserWithRole,
    updateUserPassword: updateUserPassword,
    getUsers: getUsers,
    getOneUser: getOneUser,
    getUserWithOAuth: getUserWithOAuth,
    getActiveUser: getActiveUser,
    getInactiveUser: getInactiveUser,
    deleteUser: deleteUser,
    setInactiveUser: setInactiveUser,
    createNewUser: createNewUser,

    getFirstStream: getFirstStream,
    recordStream: recordStream,
    stopStream: stopStream,

    costUsers: costUsers,
    costSubscribe: costSubscribe,
    costListen: costListen,
    costStreamsListen: costStreamsListen,
    costRadiosListen: costRadiosListen,
    costActiveChannels: costActiveChannels,
    costRadios: costRadios,
    costCreatedStream: costCreatedStream,
    costCreatedStreamForUser: costCreatedStreamForUser,
    costFavoriteForUser: costFavoriteForUser,
    costListenForUser: costListenForUser,
    costSignalementsForUser: costSignalementsForUser,
    costSignalements: costSignalements,
    costActiveUsers: costActiveUsers,
    costInactiveUsers: costInactiveUsers,
    costInactiveChannels: costInactiveChannels,
    costBanishChannels: costBanishChannels,
    costPlanStreamForUser: costPlanStreamForUser,
    costPlan: costPlan,

    getAllSubscriptions: getAllSubscriptions,
    checkIfUserIsSubscribe: checkIfUserIsSubscribe,
    doPayment: doPayment
};
