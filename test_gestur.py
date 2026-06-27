import cv2
import mediapipe as mp
import time

from mediapipe.tasks.python import vision
from mediapipe.tasks.python import BaseOptions

from config import MODEL_PATH, MAPPING_GESTUR

options = vision.GestureRecognizerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=vision.RunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.7,
)
recognizer = vision.GestureRecognizer.create_from_options(options)

cap = cv2.VideoCapture(0)

print("Tekan 'q' untuk keluar")

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break

    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    timestamp_ms = int(time.time() * 1000)
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = recognizer.recognize_for_video(mp_image, timestamp_ms)

    if result.gestures:
        gesture_name = result.gestures[0][0].category_name
        score = result.gestures[0][0].score
        gestur_rps = MAPPING_GESTUR.get(gesture_name, "?")
        cv2.putText(frame, f"Gesture: {gesture_name} ({score:.2f})", (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        cv2.putText(frame, f"RPS: {gestur_rps}", (10, 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

    if result.hand_landmarks:
        vision.drawing_utils.draw_landmarks(
            frame,
            result.hand_landmarks[0],
            vision.HandLandmarksConnections.HAND_CONNECTIONS,
        )

    cv2.imshow("Test Gestur", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
