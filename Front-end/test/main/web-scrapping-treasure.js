import * as puppeteer from 'puppeteer'

const url = 'https://www.tesourodireto.com.br/titulos/precos-e-taxas.htm';

const browser = await puppeteer.launch();
const page = await browser.newPage();


await page.goto(url);

const data = await page.$$eval('.td-invest-table__row', row => {
    return row.map((e) => {
        const titles = Array.from(e.querySelectorAll('.td-invest-table__name__text'));
        const cells = Array.from(e.querySelectorAll('span.td-invest-table__col__text'));

        return {
            title: titles[0]?.getAttribute('aria-label'),
            profitability: cells[0]?.textContent.trim(),
            minInvestment: cells[1]?.textContent.trim(),
            unitPrice: cells[2]?.textContent.trim(),
            dueDate: cells[3]?.textContent.trim(),
        }
    });
})

console.log(data.slice(1, Math.ceil(data.length/2) - 11))

await browser.close();