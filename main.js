const { app, BrowserWindow, ipcMain } = require('electron')
/********************************** Imports **********************************************/
const rp = require('request-promise');
const tough = require('tough-cookie');
const config = require("./config.js");

/********************************** Variables **********************************************/
var win;
var cmcWin;

/********************************** getting the numbers **********************************************/
function getPriceFromAPI(currency, callbackFunction) {
	const requestOptions = {
		method: 'GET',
		uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
		qs: {
			'slug': 'safemoon',
			'convert': currency
		},
		headers: {
			'X-CMC_PRO_API_KEY': config.apiKey
		},
		json: true,
		gzip: true
	};

	rp(requestOptions).then(response => {
		var quote = response.data[Object.keys(response.data)[0]].quote;
		var price = quote[Object.keys(quote)[0]].price;
		callbackFunction(price, currency);
	}).catch((err) => {
		console.log('API call error');
	});
}

var currencyQueue = [];
var cmcWindowUsed = false;
function getPriceFromCMCWindow(currency, callbackFunction, force = false) {
	if(cmcWindowUsed && !force) {
		currencyQueue.push({currency: currency, callbackFunction: callbackFunction});
	} else {
		cmcWindowUsed = true;
		cmcWin.webContents.executeJavaScript("sendPrice('" + currency + "');");
		ipcMain.once('newprice', (event, price) => {
			callbackFunction(price, currency);
			//handle next queue element
			if(currencyQueue.length > 0) {
				var newRequest = currencyQueue.shift();
				getPriceFromCMCWindow(newRequest.currency, newRequest.callbackFunction, true);
			} else {
				cmcWindowUsed = false;
			}
		});
	}
}

/********************************** Main functions **********************************************/
function sendUpdate(price, currency) {
	win.webContents.send('priceupdate', price, currency);
}

function priceLoop() {
	//get price from website or api (can be configured in config.js)
	if(config.apiKey != "") {
		getPriceFromAPI("EUR", sendUpdate);
		getPriceFromAPI("USD", sendUpdate);
	} else {
		getPriceFromCMCWindow("EUR", sendUpdate);
		getPriceFromCMCWindow("USD", sendUpdate);
	}

	setTimeout(priceLoop, config.updateInterval);
}


/********************************** Create window **********************************************/
//script for coinmarketcap injection
var injectionScript = `
var $$ = undefined;
try {
	$$ = require('./resources/app/jquery.min.js');
} catch(err) {
	$$ = require('./jquery.min.js');
}
var ipc = require('electron').ipcRenderer;

function changeCurrency(currency, callback) {
	$$(".sc-10dhc7s-0").each(function(index, element) {
		if(index == 1) {
			element.click();
			return;
		}
	});
	setTimeout(() => {
		$$(".bBcNle").click();
		$$("span.cmc-currency-picker--label").each(function(index, element) {
			if(element.innerText == currency) {
				element.click();
				return;
			}
		});
		if(callback != undefined) callback();
	}, 50);
}
function sendPrice(currency) {
	changeCurrency(currency, () => {
		let currentPrice = document.getElementsByClassName("priceValue___11gHJ")[0].innerText.substring(1);
		ipc.send('newprice', currentPrice);
	});
}
changeCurrency("USD");
`;

//open windows
app.whenReady().then(() => {
	//hidden coinmarketcap window
	if(config.apiKey == "") {
		cmcWin = new BrowserWindow({
			width: 480,
			height: 320,
			show: true,
			webPreferences: {
				nodeIntegration: true,
				contextIsolation: false
			}
		});
		cmcWin.loadURL("https://coinmarketcap.com/currencies/safemoon/");
		cmcWin.webContents.on('did-finish-load', () => {
			cmcWin.webContents.executeJavaScript(injectionScript);
		});
	}

	//start app window
	win = new BrowserWindow({
		width: 600,
		height: 600,
		fullscreen: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	win.loadFile('index.html')
	win.on('closed', () => {
		if (process.platform !== 'darwin') {
			app.quit()
		}
	});

	win.webContents.on('did-finish-load', () => {
		//start loop
		setTimeout(priceLoop, 15000);
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
});