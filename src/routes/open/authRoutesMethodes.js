const mongoose = require('mongoose'),
    { validationResult } = require('express-validator'),
    jwt = require('jsonwebtoken'),
    Channel = require('../../models/channel');

const { facebookUserLogin, addChannelIdToNewUser, generateOAuth2Token, getUserByEmail, userBack, getUserByResetPassword, updatePassword, confirmUserEmail } = require('../../controller/user');
const { setActiveChannelByID } = require('../../controller/channel');
const { sendEmail } = require('../../controller/forgot');
const { sendConfirmationEmail } = require('../../controller/confirmation');
const { getAllRadios } = require('../../controller/radio');

let user;

module.exports = injectedUser => {
    user = injectedUser;

    return {
        register: register,
        confirmUser: confirmUser,
        login: login,
        facebookLogin: facebookLogin,
        forgotPassword: forgotPassword,
        resetPassword: resetPassword,
        getRadios: getRadios
    }
};

const register = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendResponse(res, {
            message: 'Erreur de validation',
        }, errors.array())
    } else {
        let data = {
            email: req.body.email.toLowerCase(),
            username: req.body.username,
            password: req.body.password
        };

        try {
            const userExist = await getUserByEmail(JSON.stringify(data.email));
            if (userExist[0].status === 'INACTIVE') {
                await userBack(userExist, data);
                await setActiveChannelByID(userExist[0].channel_id);

                generateOAuth2Token(userExist[0].user_id).then( token => {
                    sendResponse(res, {
                        message: 'Inscription de l\'utilisateur et de sa chaîne effectué avec succès',
                        token: token
                    }, null)
                });
            } else {
                sendResponse(res, {
                    message: 'Il semblerait que vous avez déjà un compte chez nous ! Si vous ne vous souvenez plus de votre mot de passe, vous pouvez le restaurer en cliquant sur - Mot de passe oublié - !',
                }, 'Impossible de vous inscrire')
            }
        } catch (err) {
            user.checkUserExist(req.body.email, async (sqlError, doesUserExist) => {
                if (sqlError !== null || doesUserExist){
                    const message = sqlError !== null ? "Operation unsuccessful" : "User already exists";

                    sendResponse(res, message, sqlError);

                    return
                }

                user.register(data, dataResponseObject => {
                    let channel = {
                        user_id: dataResponseObject.results.insertId,
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
                            await addChannelIdToUser(dataResponseObject.results.insertId, result._id);
                        } catch (e) {
                            console.log(e);
                        }

                        if (e) {
                            res.status(401).send(e)
                        }
                    });

                    const message =  dataResponseObject.error === null  ? "Inscription utilisateur et sa chaîne effectué avec succès !" : "Erreur pour l'inscription de l'utilisateur";
                    generateOAuth2Token(dataResponseObject.results.insertId).then( token => {
                        sendResponse(res, {
                            message: message,
                            token: token
                        }, dataResponseObject.error)
                    });

                    /*sendConfirmationEmail(dataResponseObject.results.insertId, data.email, res).then(() => {
                        sendResponse(res, {
                            message: message,
                            email: "Un email pour confirmer l'adresse email à été envoyé"
                        })
                    })*/
                });
            });
        }
    }
};

const confirmUser = async (req, res) => {
    const token = req.params.token;
    await jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
        if (err) {
            res.status(400).send({
                success: false,
                error: true,
                message: 'Le token n\'est pas au bon format. Il devrait être de type JWT'
            })
        } else {
            try {
                const user = await getUserByResetPassword(result);

                if (user) {
                    if (user[0].confirmed) {
                        res.status(400).send({
                            success: false,
                            error: true,
                            message: 'Il semblerait que l\'utilisateur à déjà vérifié son adresse email'
                        })
                    } else {
                        await confirmUserEmail(user);

                        res.status(200).send({
                            success: true,
                            error: false,
                            message: 'Email vérifié avec succès !'
                        })
                    }
                    /*await updatePassword(req.body.password, user);

                    res.status(200).send({
                        success: true,
                        password: 'Updated !'
                    })*/
                }
            } catch (e) {
                res.status(400).send({
                    success: false,
                    error: e
                })
            }
        }
    });
};

const login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        sendResponse(res, {
            message: 'Erreur de validation',
        }, errors.array())
    } else {
        let data = {
            email: req.body.email.toLowerCase(),
            password: req.body.password
        };

        try {
            const userExist = await getUserByEmail(JSON.stringify(data.email));

            if (userExist) {
                if (userExist[0].status === "INACTIVE") {
                    sendResponse(res, {
                        error: true,
                        message: 'Il semblerait que vous n\'existez pas chez nous. Merci de vous inscrire !'
                    })
                } /*else if (!userExist[0].confirmed) {
                    sendResponse(res, {
                        error: true,
                        message: 'Veuillez confirmer votre adresse email pour pouvoir vous connecter !'
                    })
                }*/ else {
                    user.login(data, userExist, dataResponseObject => {
                        const message =  dataResponseObject.error === null  ? "Connected !" : "Failed to connect";
                        generateOAuth2Token(userExist[0].user_id).then( token => {
                            sendResponse(res, {
                                message: message,
                                token: (dataResponseObject.error !== null) ? null : token
                            }, dataResponseObject.error)
                        });
                    });
                }
            }
        } catch (err) {
            sendResponse(res, {
                error: true,
                message: err
            })
        }
    }
};

function sendResponse(res, message, error) {
    res
        .status(error !== null ? 400 : 200)
        .json({
            'message': message,
            'error': error,
        })
}

const addChannelIdToUser = async (user_id, channel_id) => {
    await addChannelIdToNewUser(user_id, channel_id);
};

const facebookLogin = async (req, res) => {
    try {
        const profile = await facebookUserLogin(req.params.token);
        res.status(200).send({
            success: true,
            profile: profile
        })
    } catch (e) {
        res.status(400).send({
            error: true,
            message : e
        })
    }
};

const forgotPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        try {
            const user = await getUserByEmail(JSON.stringify(req.body.email.toLowerCase()));

            if (user) {
                await sendEmail(user, res);
            }
        } catch (err) {
            res.status(400).send({
                success: false,
                message: err
            });
        }
    }
};

const resetPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).send({
            success: false,
            message: 'Erreur de validation',
            error: errors.array()
        });
    } else {
        const token = req.params.token;
        const decode = jwt.verify(token, process.env.JWT_SECRET, async (err, result) => {
            if (err) {
                res.status(400).send({
                    success: false,
                    message: 'Le token n\'est pas au bon format. Il devrait être de type JWT'
                })
            } else {
                try {
                    const user = await getUserByResetPassword(result);

                    if (user) {
                        await updatePassword(req.body.password, user);

                        res.status(200).send({
                            success: true,
                            password: 'Updated !'
                        })
                    }
                } catch (e) {
                    res.status(400).send({
                        success: false,
                        error: e
                    })
                }
            }
        });
    }
};

const getRadios = async (req, res) => {
    try {
        let radios = await getAllRadios();

        res.status(200).send({
            success: true,
            radios
        });
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err
        });
    }
};
