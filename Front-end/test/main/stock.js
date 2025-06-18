import yahooFinance from "yahoo-finance2";
import statusInvest from "statusinvest";

const stocks = await statusInvest.getStockHistoricalInfo({ ticker: 'PETR4' })
console.log(stocks);