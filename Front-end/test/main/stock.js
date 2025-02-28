import yahooFinance from "yahoo-finance2";

const options = {period1: '2021-05-08'};

const results = await yahooFinance.historical("PETR4.SA", options);
console.log(results);