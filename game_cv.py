import cv2
import mediapipe as mp
import time

from mediapipe.tasks.python import vision
from mediapipe.tasks.python import BaseOptions

from config import LEBAR_FRAME, TINGGI_FRAME, MODEL_PATH, MAPPING_GESTUR
from game_engine import GameEngine
from ui_renderer import (
    gambar_status,
    gambar_countdown,
    gambar_gestur_pemain,
    gambar_gestur_komputer,
    gambar_skor,
    gambar_hasil,
)

options = vision.GestureRecognizerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=vision.RunningMode.VIDEO,
    num_hands=1,
    min_hand_detection_confidence=0.7,
)
recognizer = vision.GestureRecognizer.create_from_options(options)


def main():
    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, LEBAR_FRAME)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, TINGGI_FRAME)

    engine = GameEngine()

    print("=== GUNTING-BATU-KERTAS TANPA SENTUH ===")
    print("Tekan SPASI untuk memulai permainan")
    print("Tekan R untuk reset skor")
    print("Tekan Q untuk keluar")

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            print("Gagal menangkap gambar dari kamera.")
            break

        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        timestamp_ms = int(time.time() * 1000)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
        result = recognizer.recognize_for_video(mp_image, timestamp_ms)

        gestur_pemain = None
        if result.gestures:
            gesture_name = result.gestures[0][0].category_name
            gestur_pemain = MAPPING_GESTUR.get(gesture_name)

        if result.hand_landmarks:
            vision.drawing_utils.draw_landmarks(
                frame,
                result.hand_landmarks[0],
                vision.HandLandmarksConnections.HAND_CONNECTIONS,
            )

        engine.update(gestur_pemain)
        state = engine.state

        gambar_skor(frame, engine.skor_pemain, engine.skor_komputer)

        if state == "READY":
            gambar_status(frame, "Tekan SPASI untuk memulai babak baru")
            gambar_gestur_pemain(frame, gestur_pemain)

        elif state == "COUNTDOWN":
            sisa = engine.sisa_countdown()
            gambar_countdown(frame, sisa)
            teks = "TUNJUKKAN GESTUR ANDA..."
            if sisa == 1:
                teks = "SEKARANG!"
            gambar_status(frame, teks)
            gambar_gestur_pemain(frame, gestur_pemain)

        elif state == "THROW":
            sisa = engine.sisa_throw()
            if sisa is not None and sisa > 0:
                gambar_status(frame, f"Bekukan tangan... {sisa:.1f}s")
            else:
                gambar_status(frame, "Memproses...")
            gambar_gestur_pemain(frame, engine.pilihan_pemain)

        elif state == "RESULT":
            gambar_status(frame, "Hasil Babak")
            gambar_gestur_pemain(frame, engine.pilihan_pemain)
            gambar_gestur_komputer(frame, engine.pilihan_komputer)
            gambar_hasil(frame, engine.pemenang)

        cv2.imshow("Gunting-Batu-Kertas Tanpa Sentuh", frame)

        key = cv2.waitKey(1) & 0xFF
        if key == ord('q'):
            break
        elif key == ord('r'):
            engine.reset()
            print("Skor direset.")
        elif key == ord(' ') and engine.state == "READY":
            engine.mulai_babak()

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
