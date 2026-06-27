import random
import time
from config import TIMER

ATURAN = {
    ("batu", "gunting"): "pemain",
    ("gunting", "kertas"): "pemain",
    ("kertas", "batu"): "pemain",
    ("gunting", "batu"): "komputer",
    ("kertas", "gunting"): "komputer",
    ("batu", "kertas"): "komputer",
}

GESTUR_KOMPUTER = ["batu", "kertas", "gunting"]


class GameEngine:
    def __init__(self):
        self.state = "READY"
        self.skor_pemain = 0
        self.skor_komputer = 0
        self.babak = 0
        self.pilihan_pemain = None
        self.pilihan_komputer = None
        self.pemenang = None
        self._timer_mulai = 0
        self._gestur_dikunci = False

    def reset(self):
        self.__init__()

    def mulai_babak(self):
        self.state = "COUNTDOWN"
        self._timer_mulai = time.time()
        self._gestur_dikunci = False
        self.pilihan_pemain = None
        self.pilihan_komputer = None
        self.pemenang = None
        self.babak += 1

    def update(self, gestur_pemain):
        now = time.time()
        delta = now - self._timer_mulai

        if self.state == "COUNTDOWN":
            if delta >= TIMER['COUNTDOWN']:
                self.state = "THROW"
                self._timer_mulai = now
                self.pilihan_komputer = random.choice(GESTUR_KOMPUTER)

        elif self.state == "THROW":
            if not self._gestur_dikunci and gestur_pemain:
                self.pilihan_pemain = gestur_pemain
                self._gestur_dikunci = True

            if delta >= TIMER['THROW']:
                if not self.pilihan_pemain:
                    self.pilihan_pemain = gestur_pemain if gestur_pemain else "batu"

                if self.pilihan_pemain == self.pilihan_komputer:
                    self.pemenang = "seri"
                else:
                    self.pemenang = ATURAN.get(
                        (self.pilihan_pemain, self.pilihan_komputer), "seri"
                    )

                if self.pemenang == "pemain":
                    self.skor_pemain += 1
                elif self.pemenang == "komputer":
                    self.skor_komputer += 1

                self.state = "RESULT"
                self._timer_mulai = now

        elif self.state == "RESULT":
            if delta >= TIMER['COOLDOWN']:
                self.state = "READY"

    def sisa_countdown(self):
        if self.state == "COUNTDOWN":
            elapsed = time.time() - self._timer_mulai
            sisa = max(0, TIMER['COUNTDOWN'] - elapsed)
            return int(sisa) + 1
        return None

    def sisa_throw(self):
        if self.state == "THROW":
            elapsed = time.time() - self._timer_mulai
            return max(0, TIMER['THROW'] - elapsed)
        return None
