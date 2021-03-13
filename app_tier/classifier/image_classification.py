import torch
import torchvision.transforms as transforms
import torchvision.models as models
from PIL import Image
import json
import sys
import numpy as np
import os

path = str(sys.argv[1])
img = Image.open(path)
model = models.resnet18(pretrained=True)

model.eval()
img_tensor = transforms.ToTensor()(img).unsqueeze_(0)
outputs = model(img_tensor)
_, predicted = torch.max(outputs.data, 1)

with open('./imagenet-labels.json') as f:
    labels = json.load(f)
result = labels[np.array(predicted)[0]]
f = open("/home/ubuntu/CC_Project_App_Tier/controller/output.txt","a")
print(path+"#"+result,file=f)
os.remove(path)
