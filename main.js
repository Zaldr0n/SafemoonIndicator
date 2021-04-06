const { app, BrowserWindow } = require('electron')
const rp = require('request-promise');

const apiKey = 'aada6cb4-7991-429c-8e38-d88d0bb36f78';
const updateInterval = 10000;
var win;

function getPrice(currency, callbackFunction) {
	const requestOptions = {
		method: 'GET',
		uri: 'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest',
		qs: {
			'slug': 'safemoon',
			'convert': currency
		},
		headers: {
			'X-CMC_PRO_API_KEY': apiKey
		},
		json: true,
		gzip: true
	};

	rp(requestOptions).then(response => {
		var quote = response.data[Object.keys(response.data)[0]].quote;
		var price = quote[Object.keys(quote)[0]].price;
		callbackFunction(price, currency);
	}).catch((err) => {
		console.log('API call error:', err.message);
	});
}

function sendUpdate(price, currency) {
	win.webContents.send('priceupdate', price, currency);
}

app.whenReady().then(() => {
	win = new BrowserWindow({
		width: 480,
		height: 320,
		fullscreen: true,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false
		}
	});

	win.loadFile('index.html')

	win.webContents.on('did-finish-load', () => {
		setInterval(() => {
			getPrice("EUR", sendUpdate);
			getPrice("USD", sendUpdate);
		}, updateInterval);
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