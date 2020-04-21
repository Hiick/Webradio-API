const cheerio = require('cheerio'),
    axios = require('axios'),
    mongoose = require('mongoose'),
    Radio = require('../models/radio');

const name = [],
    logo = [],
    url = [],
    redirect_url = [];

const fetchData = async (url) => {
    const html = await axios.get(url);
    return cheerio.load(html.data);
};

(getResults = async () => {

    const site_url = "https://www.allzicradio.com/fr/radios/pays/FR/france";
    let $ = await fetchData(site_url);

    $(".card-body .card-title a").each((index, element) => {
        name.push($(element).attr('title'));
    });
    $(".mx-auto a img").each((index, element) => {
        logo.push($(element).attr('src'));
    });
    $(".col-sm-6 .card .card-body").next().each(async (index, element) => {
        redirect_url.push({
            url: $(element).attr('href')
        });
    });

    for (let i = 0; i < redirect_url.length; i++) {
        console.log(i + ': En cours');
        let flux_url = await fetchData(redirect_url[i].url);
        url.push(flux_url(".form-group .col-sm-10 input").attr('value'));
    }

    for(let i = 0; i < 1147; i++) {
        let radio = {
            radio_name: name[i],
            logo: logo[i],
            Stream: {
                _id: new mongoose.Types.ObjectId,
                direct_url: url[i],
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
        console.log(i + ': Done');
    }
})();
