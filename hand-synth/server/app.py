import base64
import os
import time
from typing import Optional
from flask import Flask, jsonify
from flask_socketio import SocketIO
import cv2
import torch
from torchvision import transforms
from model.utils import MobileNetV3LargeUNet, heatmaps_to_coordinates
from model.globals import DATASET_MEANS, DATASET_STDS, MODEL_IMG_SIZE, N_KEYPOINTS
import numpy as np
from PIL import Image
import mediapipe as mp

SAVE_DIR = "sample_imgs/"

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

if torch.cuda.is_available():
    device="cuda"
else:
    device="cpu"

mp_hands = mp.solutions.hands
hand_detector = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)

#Create and load model
model = MobileNetV3LargeUNet(21).to(device)
# checkpoint = torch.load("/Users/thebigmoney/Documents/University/Autumn 25/Deep Learning/Assignments/Assignment 3/checkpoint_11_128.pth", map_location=device)
checkpoint = torch.load("model/checkpoint_11_128.pth", map_location=device)
model.load_state_dict(checkpoint['model_state_dict'])
model.eval()

transform = transforms.Compose([
    transforms.ToPILImage(),
    transforms.Resize([MODEL_IMG_SIZE, MODEL_IMG_SIZE], Image.BILINEAR),
    transforms.ToTensor(),
    transforms.Normalize(mean=DATASET_MEANS, std=DATASET_STDS)
])

def detect_hand_gesture(keypoints: np.ndarray) -> str:

    thumb  = keypoints[4,  1] < keypoints[2,  1]
    index = keypoints[8,  1] < keypoints[6,  1]
    middle = keypoints[12, 1] < keypoints[10, 1]
    ring   = keypoints[16, 1] < keypoints[14, 1]
    pinky  = keypoints[20, 1] < keypoints[18, 1]

    cnt = sum([index, middle, ring, pinky])

    #CALL ME
    if thumb and pinky and not any([index, middle, ring]):
        return "call-me"

    #FIST
    if cnt == 0 and not thumb:
        return "fist"

    #POINT
    if index and not any([middle, ring, pinky]):
        return "point"

    #PEACE
    if index and middle and not any([ring, pinky]):
        return "peace"
    
    #THREE FINGERS
    if index and middle and ring and not pinky:
        return "three-fingers"

    #PALM
    if cnt == 4:
        return "palm"

    # fallback
    return "fist"

def detect_gestures():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Cannot open camera")
        exit()

    left_gesture_prev = None

    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret: 
            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hand_detector.process(frame_rgb)
        if not results.multi_hand_landmarks:
            socketio.emit("gesture", {
                "gesture": "no-hand",
                "keypoints": []
            })
            socketio.sleep(0.2)
            continue

        transformed_frame = transform(frame_rgb)
        transformed_frame = transformed_frame.unsqueeze(0)
        transformed_frame.to(device)

        #Predict from Model:
        with torch.no_grad():
            pred_heatmaps = model(transformed_frame)

        hm_np = pred_heatmaps.squeeze(0).cpu().numpy()[None,...]  
        norm_pts = heatmaps_to_coordinates(hm_np)[0] 

        height, width, _ = frame.shape
        keypoints_scaled = norm_pts * np.array([width, height])

        gesture = detect_hand_gesture(keypoints_scaled)
        print(f"Detected Gesture: {gesture}")
        socketio.emit("gesture", {
                "gesture": gesture,
                "keypoints": norm_pts.tolist()
            }
        )
        socketio.sleep(0.2)
    
    cap.release()

@socketio.on("connect")
def start_tracking():
    socketio.start_background_task(detect_gestures)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
