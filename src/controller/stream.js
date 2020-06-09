require('dotenv').config();
const AudioRecorder = require('node-audiorecorder'),
    fs = require('fs'),
    createBuffer = require('audio-buffer-from'),
    Radio = require('../models/radio'),
    Channel = require('../models/channel'),
    toWav = require('audiobuffer-to-wav'),
    path = require('path');

const Lame = require("node-lame").Lame;

const recordVoice = async (channel, radio) => {

    try {
        const radio_exist = await Radio.findById({ _id: radio });
        const channel_exist = await Channel.findById({ _id: channel });

        if (radio_exist && channel_exist) {
            await Channel.updateOne({_id: channel}, {
                $set: {
                    Flux: [{
                        first_source: {
                            source_url: 'localhost:3000/authorized/stream/generate/'+channel+'?radio_id='+radio,
                            name: channel_exist.channel_name,
                            volume_source: 10
                        },
                        second_source: {
                            source_url: radio_exist.Stream.direct_url,
                            name: radio_exist.radio_name,
                            volume_source: 10
                        }
                    }]
                }
            });

            const DIRECTORY = 'Stream';
            const audioRecorder = new AudioRecorder({
                program: process.platform === 'win32' ? 'sox' : 'rec',
                silence: 0
            }, console);

            if (!fs.existsSync(DIRECTORY)) {
                fs.mkdirSync(DIRECTORY);
            }

            const file = 'Stream_'+channel+'_'+radio;
            const filename = path.join(DIRECTORY, file.concat('.mp3'));

            const fileStream = fs.createWriteStream(filename, { encoding: 'binary' });
            audioRecorder.start().stream().pipe(fileStream);

            let fileSize = 0;
            let finalSize = 0;

            setInterval(async () => {
                fs.readFile(fileStream.path,  async (err, buffer) => {
                    if (err) {
                        throw err;
                    }

                    // Regarder createFile
                    const cutStream = fs.createWriteStream('Stream/stream_'+channel+buffer.length+'.mp3');

                    if (fileSize === 0) {
                        cutStream.write(buffer);
                    } else if (finalSize === buffer.length) {
                        clearInterval();
                    } else {
                        let test = Buffer.from(buffer)

                        setTimeout(() => {
                            let encoder = new Lame({
                                output: createBuffer(test.slice(finalSize, test.length)),
                                bitrate: 192
                            }).setFile('Stream/stream_'+channel+buffer.length+'.mp3');

                            encoder.encode().catch(error => {
                                console.log(error)
                            })
                        }, 1000)
                    }

                    fileSize = buffer;
                    finalSize = buffer.length;
                });
            }, 2000)

            return file;

        }
    } catch (err) {
        return err
    }
};

const stopRecordVoice = () => {
    const audioRecorder = new AudioRecorder({
        program: process.platform === 'win32' ? 'sox' : 'rec',
        silence: 0
    }, console);
    audioRecorder.stop();

    // Send file to firebase
    // Delete file
};

module.exports = {
    recordVoice,
    stopRecordVoice
};
