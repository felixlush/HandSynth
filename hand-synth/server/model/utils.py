import torch.nn as nn
import numpy as np
import torch
import matplotlib.pyplot as plt
from tqdm import tqdm
from torchvision import models
from torchvision.models import MobileNet_V3_Large_Weights
import cv2
from model.globals import N_KEYPOINTS, MODEL_IMG_SIZE

class DoubleConv(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.double_conv = nn.Sequential(
            nn.BatchNorm2d(in_channels),
            nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(out_channels),
            nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
            nn.ReLU(inplace=True),
        )
    def forward(self, x):
        return self.double_conv(x)

class Decoder(nn.Module):
    def __init__(self, in_channels, out_channels):
        super().__init__()
        self.upsample = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=False)
        self.conv = DoubleConv(in_channels, out_channels)

    def forward(self, x, skip=None):
        x = self.upsample(x)
        if skip is not None:
            x = torch.cat([x, skip], dim=1)
        return self.conv(x)

class MobileNetV3LargeUNet(nn.Module):
    def __init__(self, num_keypoints=21, input_size=256):
        super().__init__()

        mb = models.mobilenet_v3_large(weights=MobileNet_V3_Large_Weights.DEFAULT)
        features = mb.features

        # Encoder stages
        self.enc1 = nn.Sequential(*features[:3])   
        self.enc2 = nn.Sequential(*features[3:6])  
        self.enc3 = nn.Sequential(*features[6:12]) 
        self.enc4 = nn.Sequential(*features[12:])  

        
        dummy = torch.zeros(1, 3, input_size, input_size)
        c1 = self.enc1(dummy).shape[1]
        c2 = self.enc2(self.enc1(dummy)).shape[1]
        c3 = self.enc3(self.enc2(self.enc1(dummy))).shape[1]
        _  = self.enc4(self.enc3(self.enc2(self.enc1(dummy))))

        #decoder stage -> output 64 x 64 heatmap
        self.dec1 = Decoder(in_channels=960 + c3, out_channels=256)
        self.dec2 = Decoder(in_channels=256 + c2, out_channels=128)
        self.dec3 = Decoder(in_channels=128 + c1, out_channels=64)

        self.head = nn.Sequential(
            nn.Conv2d(64, num_keypoints, kernel_size=1),
            nn.Sigmoid()
        )

    def forward(self, x):
        x1 = self.enc1(x)  
        x2 = self.enc2(x1) 
        x3 = self.enc3(x2) 
        x4 = self.enc4(x3) 

        d1 = self.dec1(x4, x3)  
        d2 = self.dec2(d1, x2)  
        d3 = self.dec3(d2, x1)  

        heatmaps = self.head(d3)  
        return heatmaps



def project_points(xyz, K):
    xyz = np.array(xyz)
    K = np.array(K)
    uv = np.matmul(K, xyz.T).T
    return uv[:, :2] / uv[:, -1:]


def get_norm_params(dataloader):
    mean = 0.0
    std = 0.0
    nb_samples = 0.0

    for i, sample in tqdm(enumerate(dataloader)):
        data = sample["image_raw"]
        batch_samples = data.size(0)
        data = data.view(batch_samples, data.size(1), -1)
        mean += data.mean(2).sum(0)
        std += data.std(2).sum(0)
        nb_samples += batch_samples

    mean /= nb_samples
    std /= nb_samples
    return {"mean": mean, "std": std}


def vector_to_heatmaps(keypoints):
    HEATMAP_SIZE = MODEL_IMG_SIZE // 4
    
    heatmaps = np.zeros((N_KEYPOINTS, HEATMAP_SIZE, HEATMAP_SIZE), dtype=np.float32)
    
    for k, (x, y) in enumerate(keypoints):
        hx = int(x * HEATMAP_SIZE)
        hy = int(y * HEATMAP_SIZE)
        
        if 0 <= hx < HEATMAP_SIZE and 0 <= hy < HEATMAP_SIZE:
            heatmaps[k, hy, hx] = 1.0
    
    return blur_heatmaps(heatmaps)


def blur_heatmaps(heatmaps):
    heatmaps_blurred = heatmaps.copy()
    for k in range(len(heatmaps)):
        if heatmaps_blurred[k].max() == 1:
            heatmaps_blurred[k] = cv2.GaussianBlur(heatmaps[k], (51, 51), 3)
            heatmaps_blurred[k] = heatmaps_blurred[k] / heatmaps_blurred[k].max()
    return heatmaps_blurred


class IoULoss(nn.Module):

    def __init__(self):
        super(IoULoss, self).__init__()
        self.EPSILON = 1e-6

    def _op_sum(self, x):
        return x.sum(-1).sum(-1)

    def forward(self, y_pred, y_true):
        inter = self._op_sum(y_true * y_pred)
        union = (
            self._op_sum(y_true ** 2)
            + self._op_sum(y_pred ** 2)
            - self._op_sum(y_true * y_pred)
        )
        iou = (inter + self.EPSILON) / (union + self.EPSILON)
        iou = torch.mean(iou)
        return 1 - iou


def heatmaps_to_coordinates(heatmaps):
    B, K, Hm, Wm = heatmaps.shape
    sums = heatmaps.sum(axis=(2,3), keepdims=True) + 1e-6
    norm = heatmaps / sums

    x_prob = norm.sum(axis=2) 
    y_prob = norm.sum(axis=3)

    xs = np.arange(Wm, dtype=np.float32)
    ys = np.arange(Hm, dtype=np.float32)

    x_coords = (x_prob * xs[None,None,:]).sum(axis=2) 
    y_coords = (y_prob * ys[None,None,:]).sum(axis=2) 

    x_norm = x_coords / float(Wm)
    y_norm = y_coords / float(Hm)

    return np.stack([x_norm, y_norm], axis=-1) 
