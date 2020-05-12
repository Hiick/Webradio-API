const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const RadioSchema = new Schema({
    user_id: String,
    radio_name: String,
    logo: String,
    Stream: {
        _id: String,
        direct_url: String,
        createdAt: Date,
    },
    Favoris: [JSON],
    radio: Boolean,
    nbr_ecoute: Number,
    nbr_ecoute_global: Number,
    status: String,
    createdAt: Date
});

RadioSchema.pre('save', next => {
    if (!this.createdAt) {
        this.createdAt = new Date();
    }
    next();
});

module.exports = mongoose.model('radio', RadioSchema);
