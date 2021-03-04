#!/bin/bash

cd Listener
node sqs_receive.js
image_name=$(find ./ -type f \( -iname \.jpeg -o -iname \.jpg -o -iname \*.png \))
python3 image_classification.py $image_name
