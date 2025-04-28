from flask import Flask, jsonify
from flask_socketio import SocketIO
import cv2
import mediapipe as mp
import numpy as np

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(max_num_hands=2)
mp_draw = mp.solutions.drawing_utils

def detect_left_hand_gesture(hand_landmarks):
    index_extended = hand_landmarks.landmark[8].y < hand_landmarks.landmark[6].y
    middle_extended = hand_landmarks.landmark[12].y < hand_landmarks.landmark[10].y
    ring_extended = hand_landmarks.landmark[16].y < hand_landmarks.landmark[14].y
    pinky_extended = hand_landmarks.landmark[20].y < hand_landmarks.landmark[18].y

    count = sum([index_extended, middle_extended, ring_extended, pinky_extended])
    
    if count == 0:
        return "fist"
    elif count == 1:
        if index_extended and not middle_extended and not ring_extended and not pinky_extended:
            return "peace"
        else:
            return "fist"
    elif count == 2:
        if index_extended and middle_extended and not ring_extended and not pinky_extended:
            return "peace"
        else:
            return "fist"
    elif count == 4:
        return "palm"
    else:
        return "palm"

def detect_gestures():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Cannot open camera")
        exit()

    left_gesture_prev = None

    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = hands.process(rgb_frame)

        if result.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(result.multi_hand_landmarks, result.multi_handedness):
                hand_label = handedness.classification[0].label

                if hand_label == "Right":
                    # Use right hand for effect control.
                    wrist = hand_landmarks.landmark[0]
                    filter_val = int(np.interp(wrist.y, [0, 1], [2000, 200]))
                    reverb_val = int(np.interp(wrist.x, [0, 1], [0, 127]))
                    thumb_index_distance = np.abs(hand_landmarks.landmark[4].x - hand_landmarks.landmark[8].x)
                    modulation = int(np.interp(thumb_index_distance, [0.0, 0.2], [0, 127]))

                    socketio.emit("effect_data", {
                        "filter_cutoff": filter_val,
                        "reverb": reverb_val,
                        "modulation": modulation
                    })

                elif hand_label == "Left":
                    # Use left hand for chord triggering.
                    gesture = detect_left_hand_gesture(hand_landmarks)
                    socketio.emit("gesture", {"gesture": gesture})
                    # (Server no longer sends MIDI; client will handle MIDI output.)
                    
                    # Optionally, you could keep state here if needed.
                    left_gesture_prev = gesture
        # Adjust sleep time as needed
        socketio.sleep(0.2)
    cap.release()

@socketio.on("connect")
def start_tracking():
    socketio.start_background_task(detect_gestures)

if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
