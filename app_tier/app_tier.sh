#!/bin/bash

cd /home/ubuntu/CC_Project_App_Tier/controller
node sqs_receive_app_tier.js
cd /home/ubuntu/CC_Project_App_Tier/classifier
image_name=$(find ./ -type f \( -iname \*.jpeg -o -iname \*.jpg -o -iname \*.png \))
python3 image_classification.py $image_name
cd /home/ubuntu/CC_Project_App_Tier/controller
node sqs_send_app_tier.js
