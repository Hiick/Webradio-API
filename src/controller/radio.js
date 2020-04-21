require('dotenv').config();
const Radio = require('../models/radio'),
    mongoose = require('mongoose');

const addNewRadio = async (data) => {
    const radioExist = await Radio.findOne({ radio_name: data.radio_name});

    if (!radioExist) {
        let radio = {
            radio_name: data.radio_name,
            logo: data.logo,
            Stream: {
                _id: new mongoose.Types.ObjectId,
                direct_url: data.direct_url,
                createdAt: new Date(),
            },
            radio: true,
            status: "RADIO",
            createdAt: new Date()
        };

        const newRadio = Radio(radio);
        newRadio.save((e) => {
            if (e) {
                throw new Error('Error with Radio register');
            }
        });

        return {
            message: 'Radio ajoutée avec succès'
        }
    } else {
        return {
            message: 'La radio existe déjà'
        }
    }
};
const getAllRadios = async () => {
    return await Radio.find();
};
const getRadioByID = async (radio_id) => {
    return await Radio.findById({ _id: radio_id });
};
const updateRadioByID = async (data, id) => {
    const radioExist = Radio.findById({ _id: id});

    if (radioExist) {
        return await Radio.updateOne({ _id: id }, {
            $set: {
                radio_name: data.radio_name,
                logo: data.logo,
                direct_url: data.direct_url
            }
        })
    }
};
const deleteRadioByID = async (id) => {
    const radioExist = Radio.findById({ _id: id});

    if (radioExist) {
        return await Radio.deleteOne({ _id: id });
    }
};

module.exports = {
    addNewRadio,
    getAllRadios,
    getRadioByID,
    updateRadioByID,
    deleteRadioByID
};
