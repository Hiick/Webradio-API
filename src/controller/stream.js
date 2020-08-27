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

/*const recordVoice = async (channel, radio) => {

    try {
        const radio_exist = await Radio.findById({ _id: radio });
        const channel_exist = await Channel.findById({ _id: channel });

        if (radio_exist && channel_exist) {
            /!*await Channel.updateOne({_id: channel}, {
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
            });*!/

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

                    const cutStream = fs.createWriteStream('Stream/cut_'+channel+'_'+buffer.length+'.mp3');

                    if (fileSize === 0) {
                        cutStream.write(buffer);
                    } else if (finalSize === buffer.length) {
                        clearInterval();
                    } else {
                        let test = Buffer.from(buffer)

                        let audio = createBuffer(test.slice(finalSize, test.length))

                        await audioContext.decodeAudioData(new Buffer(audio), data => {
                            let wav = toWav(data);
                            let chunk = new Uint8Array(wav);

                            fs.appendFile('Stream/cut_'+channel+'_'+buffer.length+'.mp3', Buffer.from(chunk), (cb) => {
                                console.log(cb)
                            })

                        }, error => {
                            console.log('Error : ' + error)
                        });
                    }

                    fileSize = buffer;
                    finalSize = buffer.length;
                });
            }, 3000)

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
};*/

const createStreamFromFolder = async (channel_id, radio_id, file) => {
    const DIRECTORY = 'Stream';
    const CHANNEL = channel_id;
    const REAL_STREAM = 'Real_Stream';
    const CONCAT_FOLDER = 'Concat_Folder';

    if (!fs.existsSync(DIRECTORY)) {
        fs.mkdirSync(DIRECTORY);
        fs.mkdirSync('Stream/'+CHANNEL);
        fs.mkdirSync('Stream/'+CHANNEL+REAL_STREAM);
        fs.mkdirSync('Stream/'+CHANNEL+CONCAT_FOLDER);
    } else {
        if (!fs.existsSync('Stream/'+CHANNEL)) {
            fs.mkdirSync('Stream/'+CHANNEL);
            fs.mkdirSync('Stream/'+CHANNEL+'/'+REAL_STREAM);
            fs.mkdirSync('Stream/'+CHANNEL+'/'+CONCAT_FOLDER);
        }
    }

    const streamId = file.filename;
    const filename = path.join(DIRECTORY+'/'+channel_id+'/'+CONCAT_FOLDER,  streamId.concat('.mp3'));
    const filestream = await fs.createWriteStream(filename);
    await fs.createWriteStream('Stream/'+CHANNEL+'/Real_Stream/stream.mp3');

    await moveFile(file.path, filestream.path, (err) => {
        if (err) return err;
    })

    fs.readFile(filestream.path, async (err, data) => {
        console.log(data);
    })

    /*fs.readdir('Stream/'+CHANNEL+'/'+CONCAT_FOLDER, async (err, files) => {
        console.log(files)
        console.log(files[0] === 'Stream/'+CHANNEL+'/.DS_Store')
        if (files[0] === 'Stream/'+CHANNEL+'/'+CONCAT_FOLDER+'/.DS_Store') {
            fs.unlink('Stream/'+CHANNEL+'/'+CONCAT_FOLDER+'/.DS_Store', (err) => {
                if (err) throw err;
            });
        } else if (files.length > 1) {
            return new Promise(async (resolve, reject) => {
                await fs.readdir('Stream/'+CHANNEL+'/'+CONCAT_FOLDER, async (err, files) => {

                    if (err)
                        return reject(err);

                    files = files.map(file => path.join('Stream/'+CHANNEL+'/'+CONCAT_FOLDER,file));

                    audioconcat(files)
                        .concat('Stream/'+CHANNEL+'/Real_Stream/stream.mp3')
                        .on('start', function (res) {
                            console.log('Concat start')
                            console.log(res)
                        })
                        .on('error', function (err) {
                            console.error('Error:', err)
                        })
                        .on('end', async function () {
                            for (const file of files) {
                                fs.unlink(file, (err) => {
                                    if (err) throw err;
                                });
                                await fs.copyFile('Stream/'+CHANNEL+'/Real_Stream/stream.mp3', 'Stream/'+CHANNEL+'/'+CONCAT_FOLDER+'/stream.mp3', (err) => {
                                    if (err) return err;
                                })
                            }
                            console.error('Audios concatenated')
                        })
                });
            });
        }
    });*/

    return true;
}

const moveFile = async (oldPath, newPath, callback) => {
    await fs.rename(oldPath, newPath, function (err) {
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

    const copy = async () => {
        let readStream = await fs.createReadStream(oldPath);
        let writeStream = await fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', async function () {
            await fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

module.exports = {
    /*recordVoice,
    stopRecordVoice,*/
    createStreamFromFolder
};
