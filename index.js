/********************************** Imports **********************************************/
const electron = require("electron");

var jQuery = undefined;
var config =  undefined;
try {
	jQuery = require('./resources/app/jquery.min.js');
	config = require("./resources/app/config.js");
} catch(err) {
	jQuery = require("./jquery.min.js");
	config = require("./config.js");
}

/********************************** Helper functions **********************************************/
function toFixed(x) {
	if (Math.abs(x) < 1.0) {
		var e = parseInt(x.toString().split('e-')[1]);
		if (e) {
			x *= Math.pow(10,e-1);
			x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
		}
	} else {
		var e = parseInt(x.toString().split('+')[1]);
		if (e > 20) {
			e -= 20;
			x /= Math.pow(10,e);
			x += (new Array(e+1)).join('0');
		}
	}
	return x;
}

/********************************** Chart **********************************************/
var chart;
var priceValues = [];
var chartValues = [];
var maxChartValues = config.chartDataPoints;
var chartCurrency = "EUR";

function drawChart() {
	let ctx = document.getElementById('chart').getContext('2d');
	chart = new Chart(ctx, {
		type: 'scatter',
		data: {
			datasets: [{
				data: chartValues,
				backgroundColor: '#01a89e',
				borderColor: '#01a89e',
				borderWidth: 1,
				fill: false,
				showLine: true,
				pointRadius: 0,
				pointHoverRadius: 0,
				borderWidth: 0
			}]
		},
		options: {
			scales: {
				yAxes: [{
					display: false
				}],
				xAxes: [{
					display: false
				}]
			},
			legend: {
				display: false
			},
			animation: {
				duration: 0
			}
		}
	});
}
function redrawChart() {
	chartValues = [];
	let dif = priceValues.length - maxChartValues;
	if(dif < 0) dif = 0;
	for(let i = 0; i<maxChartValues; i++) {
		if(i+dif >= priceValues.length) break;
		chartValues.push({x: i, y: priceValues[i+dif]});
	}
	drawChart();
}

/********************************** Main **********************************************/
jQuery(() => {
	electron.ipcRenderer.on('priceupdate', (event, price, currency) => {
		let priceStr = String(toFixed(price));
		let priceLength = 12;
		if(priceStr.length > priceLength) priceStr = priceStr.substring(0, priceLength);
		while(priceStr.length < priceLength) priceStr += "0";

		if(chartCurrency == currency) {
			priceValues.push(price);
			redrawChart();
		}
		//display current price
		document.getElementById("price_" + currency).innerText = priceStr;
	});
});