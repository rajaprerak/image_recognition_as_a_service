#!/bin/bash

cd /home/ubuntu/controller
node sqs_receive_app_tier.js
cd ..
cd classifier
image_name=$(find ./ -type f \( -iname \*.jpeg -o -iname \*.jpg -o -iname \*.png \))
python3 image_classification.py $image_name
cd ..
cd controller
node sqs_send_app_tier.js
