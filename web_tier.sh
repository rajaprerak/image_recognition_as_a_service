#!/bin/bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
. ~/.nvm/nvm.sh
nvm install node
sudo apt install nodejs
sudo apt install npm
cd Cloud_Computing_CSE546_Project
npm install
sudo npm install pm2 -g
pm2 start server.js
export AWS_ACCESS_KEY_ID=AKIA5NQGXQ7RWW26VIB4
export AWS_SECRET_ACCESS_KEY=rHJO9tttT1BYnqPet9kyaZSXHZuU7YDVVkVEX7FM
nohup java -jar sample-0.0.1-SNAPSHOT-new.jar &

npm install node-ec2-metadata
npm install shelljs