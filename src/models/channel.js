const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const ChannelSchema = new Schema({
    user_id: String,
    channel_name: String,
    avatar: String,
    Flux: [{
        first_source: {
            source_url: String,
            name: String,
            volume_source: String
        },
        second_source: {
            source_url: String,
            name: String,
            volume_source: String
        }
    }],
    Stream: [{
        _id: String,
        volume_1: String,
        volume_2: String,
        direct_url: String,
        createdAt: Date,
    }],
    Favoris: [JSON],
    radio: Boolean,
    status: String,
    live: Boolean,
    stream_cree: String,
    nbr_ecoute: String,
    nbr_planification: String,
    createdAt: Date
});

ChannelSchema.pre('save', next => {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});

module.exports = mongoose.model('channel', ChannelSchema);
