require('dotenv').config();
const AudioRecorder = require('node-audiorecorder'),
    fs = require('fs'),
    createBuffer = require('audio-buffer-from'),
    Radio = require('../models/radio'),
    Channel = require('../models/channel'),
    toWav = require('audiobuffer-to-wav'),
    wav = require('node-wav'),
    WavEncoder = require("wav-encoder"),
    path = require('path');

const AudioContext = require('web-audio-api').AudioContext;
const audioContext = new AudioContext;
const async = require("async");
const audioconcat = require('audioconcat');
const ffmpeg = require('fluent-ffmpeg');
const AudioBuffer = require('audiobuffer');
const text2wav = require('text2wav')

var AudioBufferStream = require('audio-buffer-stream')
var lamejs = require('lamejs');
var base64 = require('file-base64');

const joinBase64Strings = (base64Str1, base64Str2) => {
    const bothData = Buffer.from(base64Str1, 'base64').toString('binary') +
        Buffer.from(base64Str2, 'base64').toString('binary');
    const joinedBase64Result = Buffer.from(bothData.toString(), 'binary').toString('base64');
    return joinedBase64Result;
}

const createStreamFromFolder = async(channel_id, radio_id, body) => {
    const DIRECTORY = 'Stream';
    const CHANNEL = channel_id;
    const REAL_STREAM = 'Real_Stream';
    const CONCAT_FOLDER = 'Concat_Folder';

    if (!fs.existsSync(DIRECTORY)) {
        fs.mkdirSync(DIRECTORY);
        fs.mkdirSync('Stream/' + CHANNEL);
        fs.mkdirSync('Stream/' + CHANNEL + REAL_STREAM);
        fs.mkdirSync('Stream/' + CHANNEL + CONCAT_FOLDER);
    } else {
        if (!fs.existsSync('Stream/' + CHANNEL)) {
            fs.mkdirSync('Stream/' + CHANNEL);
            fs.mkdirSync('Stream/' + CHANNEL + '/' + REAL_STREAM);
            fs.mkdirSync('Stream/' + CHANNEL + '/' + CONCAT_FOLDER);
        }
    }

    let channelinfo = await Channel.findById({ _id: channel_id });
    let radioinfo = await Radio.findById({ _id: radio_id });

    let audio = body.audio;

    const streamId = "Stream_" + channel_id + '_' + audio.length;
    const filename = path.join(DIRECTORY + '/' + channel_id + '/' + CONCAT_FOLDER, streamId.concat('.txt'));

    fs.readdir('Stream/' + CHANNEL + '/' + CONCAT_FOLDER, async(err, files) => {
        if (files.length > 0) {
            fs.readFile(`Stream/${CHANNEL}/${CONCAT_FOLDER}/${files[0]}`, async(err, data) => {
                if (err) console.log(err);
                audio = body.audio.split(",")[1];
                const newData = joinBase64Strings(data.toString(), audio)
                fs.unlink(`Stream/${CHANNEL}/${CONCAT_FOLDER}/${files[0]}`, async(err) => {
                    if (err) throw err;
                    await fs.createWriteStream(`Stream/${CHANNEL}/${CONCAT_FOLDER}/${files[0]}`);
                    fs.writeFile(`Stream/${CHANNEL}/${CONCAT_FOLDER}/${files[0]}`, newData, async (err) => {
                        if (err) console.log(err);
                        /*console.log(channelinfo);
                        console.log(radioinfo);*/
                        let radio_stream = radioinfo.Stream.direct_url;

                        return await Channel.updateOne({ _id: channel_id }, {
                            $set: {
                                Stream: [{
                                    direct_url: radio_stream
                                }]
                            }
                        })
                    });
                });
            })
        } else {
            const filestream = await fs.createWriteStream(filename);

            audio = body.audio.split(",")[1];
            fs.writeFile(filestream.path, audio, (err) => {
                if (err) console.log(err);
            });
        }
    })

    return true;
}

const moveFile = async(oldPath, newPath, callback) => {
    await fs.rename(oldPath, newPath, function(err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    const copy = async() => {
        let readStream = await fs.createReadStream(oldPath);
        let writeStream = await fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', async function() {
            await fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

const listenChannelStream = async (channel_id) => {
    let channelExist = await Channel.findById({ _id: channel_id });

    if (channelExist) {
        return new Promise((resolve, reject) => {
            fs.readdir(`Stream/${channel_id}/Concat_Folder`, async(err, files) => {
                console.log(files)
                fs.readFile(`Stream/${channel_id}/Concat_Folder/${files[0]}`, (err, data) => {
                    if (err) reject(err);
                    const base64 = data.toString();
                    resolve({
                        radio: channelExist.Stream[0].direct_url,
                        audio: base64
                    })

                })
            })
        })

    } else {
        throw new Error();
    }
}

const setChannelInLive = async (channel_id) => {
    const channelExist = await Channel.findById({ _id: channel_id});

    if (channelExist) {
        return await Channel.updateOne({ _id: channel_id }, {
            $set: {
                live: true
            }
        })
    } else {
        throw new Error();
    }
}

const removeChannelInLive = async (channel_id) => {
    const channelExist = await Channel.findById({ _id: channel_id});

    if (channelExist) {
        return await Channel.updateOne({_id: channel_id}, {
            $set: {
                live: false
            }
        })
    } else {
            throw new Error();
        }
}

/**
 * Mise en place de Socket pour l'envoi à l'infini des datas (variable audio, voir createStream) + l'url de la radio
 */

module.exports = {
    createStreamFromFolder,
    listenChannelStream,
    setChannelInLive,
    removeChannelInLive
};