require('dotenv').config();
const Channel = require('../models/channel');

const getAllChannels = async () => {
    return await Channel.find({});
};

const getChannel = async (channel_id) => {
    const channel = await Channel.findById({ _id: channel_id});

    if (channel) {
        await Channel.updateOne({ _id: channel_id }, {
            $inc: {
                nbr_ecoute: 1,
                nbr_ecoute_global: 1
            }
        });

        return channel;
    }

};

const removeOneListener = async (channel_id) => {
    const channel = await Channel.findById({ _id: channel_id});

    if (channel.nbr_ecoute > 0) {
        await Channel.updateOne({ _id: channel_id }, {
            $inc: {
                nbr_ecoute: -1
            }
        });
    } else {
        return 'Il ne peut pas y avoir moins de 0 écoutant'
    }

};

const updateChannelByID = async (channel_id, data) => {
    return await Channel.updateOne({ _id: channel_id }, {
        $set: {
            channel_name: data.channel_name,
            avatar: data.avatar
        }
    })
};

const getAllStreamChannels = async () => {
    return await Channel.find({ live: true });
};

const deleteChannelByID = async (channel_id) => {
    return await Channel.deleteOne({ _id: channel_id })
};

const getAllBanishChannels = async () => {
    return await Channel.find({ status: "BANISH" })
};

const setInactiveChannelByID = async (channel_id) => {
    return await Channel.updateOne({ _id: channel_id }, {
        $set: {
            status: 'INACTIVE'
        }
    })
};

const setActiveChannelByID = async (channel_id) => {
    return await Channel.updateOne({ _id: channel_id }, {
        $set: {
            status: 'ACTIVE'
        }
    })
};

module.exports = {
    getAllChannels,
    getChannel,
    removeOneListener,
    updateChannelByID,
    getAllStreamChannels,
    deleteChannelByID,
    getAllBanishChannels,
    setInactiveChannelByID,
    setActiveChannelByID
};
