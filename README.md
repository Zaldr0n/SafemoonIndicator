# SafemoonIndicator
Electron app for raspberry pi to display current safemoon price

To use this you can either clone the git and build the electron app yourself or you can download the raspberryBin.tar.gz

Either way you need to add your coinmarketcap api key to the code.
If you're building the app yourself edit the main.js file and edit the line: "const apiKey = '';" at the top. Just insert your api key between the ''
If you're using the prebuilt version you can find the main.js file in resources/app/ after extracting the tar archive.
You can get an api key by registering here: https://coinmarketcap.com/api/

After that you can start the app by executing ./CoinmarketcapIndicator
