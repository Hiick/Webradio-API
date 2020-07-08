const cheerio = require('cheerio'),
    axios = require('axios'),
    mongoose = require('mongoose'),
    Radio = require('../models/radio');

const httpAdapter = require('axios/lib/adapters/http');

const name = [],
    logo = [],
    url = [],
    redirect_url = [];

/*
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
})();*/

(deleteUselessRadios = async () => {
    const radios = await Radio.find();

    for (let i = 0; i < radios.length; i++) {
        axios.get(radios[i].Stream.direct_url, {
            responseType: 'stream', adapter: httpAdapter
        }).then(() => {
            console.log('Stream fonctionnel : ' + radios[i]._id)
        }).catch(() => {
            axios.delete('https://webradio-stream.herokuapp.com/authorized/radios/delete/' + radios[i]._id, {
                headers: {
                    Authorization: 'Bearer b37087add5643385ffc7be83ea24fc27c91e5344'
                }
            }).then(() => {
                console.log('Radio supprimée : ' + radios[i]._id)
            })
        });
    }
})();