import cv2
import numpy as np
from config import WARNA, FONT, FONT_BESAR, POSISI, LEBAR_FRAME, TINGGI_FRAME


def gambar_status(frame, teks):
    x, y = POSISI['STATUS']
    cv2.putText(frame, teks, (x - 200, y), FONT, 0.8, WARNA['PUTIH'], 2)
    cv2.line(frame, (50, y + 5), (LEBAR_FRAME - 50, y + 5), WARNA['HIJAU'], 1)


def gambar_countdown(frame, angka):
    if angka is None:
        return
    x, y = POSISI['COUNTDOWN']
    cv2.putText(frame, str(angka), (x - 30, y + 30), FONT_BESAR, 3, WARNA['KUNING'], 4)


def gambar_gestur_pemain(frame, gestur):
    if gestur is None:
        return
    x, y = POSISI['GESTUR_PEMAIN']
    ikon = {"batu": "\u270A", "kertas": "\u270B", "gunting": "\u270C"}
    cv2.putText(frame, f"Kamu: {gestur}", (x, y), FONT, 0.7, WARNA['BIRU'], 2)


def gambar_gestur_komputer(frame, gestur):
    if gestur is None:
        return
    x, y = POSISI['GESTUR_KOMPUTER']
    cv2.putText(frame, f"Komputer: {gestur}", (x - 180, y), FONT, 0.7, WARNA['MERAH'], 2)
    cv2.line(frame, (LEBAR_FRAME // 2, y - 30), (LEBAR_FRAME // 2, y + 30), WARNA['ABU_ABU'], 1)


def gambar_skor(frame, skor_p, skor_c):
    x, y = POSISI['SCORE']
    teks = f"Kamu {skor_p}  -  {skor_c} Komputer"
    cv2.putText(frame, teks, (x - 150, y), FONT, 0.7, WARNA['PUTIH'], 2)


def gambar_hasil(frame, hasil):
    if hasil is None:
        return
    x, y = POSISI['HASIL']
    if hasil == "pemain":
        teks = "KAMU MENANG!"
        warna = WARNA['KUNING']
    elif hasil == "komputer":
        teks = "KOMPUTER MENANG!"
        warna = WARNA['MERAH']
    else:
        teks = "SERI!"
        warna = WARNA['PUTIH']
    (w, h), _ = cv2.getTextSize(teks, FONT_BESAR, 1.3, 3)
    cv2.putText(frame, teks, (x - w // 2, y), FONT_BESAR, 1.3, warna, 3)
