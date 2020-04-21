const mongoose = require('mongoose'),
    Channel = require('../../models/channel');
const { facebookUserLogin, addChannelIdToNewUser } = require('../../controller/user');

let user;

module.exports = injectedUser => {
    user = injectedUser;

    return {
        register: register,
        login: login,
        facebookLogin: facebookLogin
    }
};

function register(req, res) {
    let datas = {
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    };

    user.checkUserExist(req.body.email, (sqlError, doesUserExist) => {
        if (sqlError !== null || doesUserExist){
            const message = sqlError !== null ? "Operation unsuccessful" : "User already exists";

            sendResponse(res, message, sqlError);

            return
        }

        user.register(datas, dataResponseObject => {
            const message =  dataResponseObject.error === null  ? "New user add with channel" : "Failed to add user";

            let channel = {
                user_id: dataResponseObject.results.insertId,
                channel_name: "",
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
                await addChannelIdToUser(dataResponseObject.results.insertId, result._id);

                if (e) {
                    res.status(401).send(e)
                }
            });

            sendResponse(res, {
                message: message,
                channel: channel
            }, dataResponseObject.error)
        })
    })
}

function login(){
}

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
