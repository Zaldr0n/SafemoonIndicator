#!/bin/bash


#download binary archive
curl -L https://raw.githubusercontent.com/Zaldr0n/SafemoonIndicator/main/raspberryBin.tar.gz > ~/Downloads/raspberryBin.tar.gz
#extract
tar -xzf ~/Downloads/raspberryBin.tar.gz --directory ~/
mv ~/SafemoonIndicator-linux-armv7l ~/SafemoonIndicator
#delete archive file (no longer needed)
rm ~/Downloads/raspberryBin.tar.gz

#create autostart entry
mkdir -p $HOME/.config/autostart
echo -e "[Desktop Entry]
Name=SafemoonIndicator
Exec=$HOME/SafemoonIndicator/SafemoonIndicator
Icon=$HOME/SafemoonIndicator/resources/app/icon.png
Type=Application
Terminal=true
" > $HOME/.config/autostart/SafemoonIndicator.desktop
chmod +x $HOME/.config/autostart/SafemoonIndicator.desktop

#create desktop shortcut
ln -s $HOME/.config/autostart/SafemoonIndicator.desktop $HOME/Desktop/SafemoonIndicator.desktop
chmod +x $HOME/Desktop/SafemoonIndicator.desktop
