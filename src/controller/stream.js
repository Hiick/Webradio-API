require('dotenv').config();
const AudioRecorder = require('node-audiorecorder'),
    fs = require('fs'),
    moment = require('moment'),
    Radio = require('../models/radio'),
    Channel = require('../models/channel'),
    path = require('path');

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
