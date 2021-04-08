//leave apiKey empty to get the numbers from website, which will need more performance
const apiKey = '';
//interval for updating price in milliseconds
const updateInterval = 30000;
//amount of prices used for the chart e.g. 6h := (60/(updateInterval  / 1000)) * 60 * 6(h)
const chartDataPoints = 720;



//don't edit this
exports.apiKey = apiKey;
exports.updateInterval = updateInterval;
