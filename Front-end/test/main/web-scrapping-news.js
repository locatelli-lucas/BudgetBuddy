import * as cheerio from 'cheerio'

const url = 'https://www.cnnbrasil.com.br/tudo-sobre/mercado-financeiro/';

const news = [];

const $ = await cheerio.fromURL(url);

const data = $.extract({
    links: [{
        selector: "a.home__list__tag",
        value: "href"
    }],
    titles: ["h3.news-item-header__title"],
    dates: ["span.home__title__date"],
    pictures: [{
        selector: "a.home__list__tag picture img",
        value: "src"
    }]
})

const dataLength = data.links.length;

for (let i = 0; i < dataLength; i++) {
    news.push({
        link: data.links[i],
        title: data.titles[i],
        date: data.dates[i],
        pictures: data.pictures[i]
    })
    
}
console.log(news)