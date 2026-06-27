import cv2

LEBAR_FRAME = 640
TINGGI_FRAME = 480

MODEL_PATH = "models/gesture_recognizer.task"

MAPPING_GESTUR = {
    "Closed_Fist": "batu",
    "Open_Palm": "kertas",
    "Victory": "gunting",
}

WARNA = {
    'HIJAU': (0, 255, 0),
    'PUTIH': (255, 255, 255),
    'MERAH': (0, 0, 255),
    'BIRU': (255, 0, 0),
    'KUNING': (0, 255, 255),
    'HITAM': (0, 0, 0),
    'ABU_ABU': (128, 128, 128),
}

FONT = cv2.FONT_HERSHEY_SIMPLEX
FONT_BESAR = cv2.FONT_HERSHEY_DUPLEX

POSISI = {
    'STATUS': (int(LEBAR_FRAME / 2), 40),
    'SCORE': (int(LEBAR_FRAME / 2), 80),
    'COUNTDOWN': (int(LEBAR_FRAME / 2), int(TINGGI_FRAME / 2)),
    'GESTUR_PEMAIN': (50, 200),
    'GESTUR_KOMPUTER': (LEBAR_FRAME - 50, 200),
    'HASIL': (int(LEBAR_FRAME / 2), int(TINGGI_FRAME / 2) + 100),
}

TIMER = {
    'COUNTDOWN': 3.0,
    'THROW': 1.0,
    'COOLDOWN': 1.5,
}
