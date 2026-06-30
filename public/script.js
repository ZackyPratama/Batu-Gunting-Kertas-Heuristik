// === KONSTANTA ===
const TIMER = { COUNTDOWN: 3.0, THROW: 1.0, COOLDOWN: 1.5 };

const ATURAN = {
  "batu-gunting": "pemain",
  "gunting-kertas": "pemain",
  "kertas-batu": "pemain",
  "gunting-batu": "komputer",
  "kertas-gunting": "komputer",
  "batu-kertas": "komputer",
};

const GESTUR_KOMPUTER = ["batu", "kertas", "gunting"];

const MAPPING_GESTUR = {
  Closed_Fist: "batu",
  Open_Palm: "kertas",
  Victory: "gunting",
};

// === GAME ENGINE ===
class GameEngine {
  constructor() {
    this.state = "READY";
    this.skorPemain = 0;
    this.skorKomputer = 0;
    this.babak = 0;
    this.pilihanPemain = null;
    this.pilihanKomputer = null;
    this.pemenang = null;
    this._timerMulai = 0;
    this._gesturDikunci = false;
  }

  reset() {
    this.state = "READY";
    this.skorPemain = 0;
    this.skorKomputer = 0;
    this.babak = 0;
    this.pilihanPemain = null;
    this.pilihanKomputer = null;
    this.pemenang = null;
    this._timerMulai = 0;
    this._gesturDikunci = false;
  }

  mulaiBabak() {
    this.state = "COUNTDOWN";
    this._timerMulai = Date.now() / 1000;
    this._gesturDikunci = false;
    this.pilihanPemain = null;
    this.pilihanKomputer = null;
    this.pemenang = null;
    this.babak++;
  }

  update(gesturPemain) {
    const now = Date.now() / 1000;
    const delta = now - this._timerMulai;

    if (this.state === "COUNTDOWN") {
      if (delta >= TIMER.COUNTDOWN) {
        this.state = "THROW";
        this._timerMulai = now;
        this.pilihanKomputer =
          GESTUR_KOMPUTER[Math.floor(Math.random() * GESTUR_KOMPUTER.length)];
      }
    } else if (this.state === "THROW") {
      if (!this._gesturDikunci && gesturPemain) {
        this.pilihanPemain = gesturPemain;
        this._gesturDikunci = true;
      }

      if (delta >= TIMER.THROW) {
        if (!this.pilihanPemain) {
          this.pilihanPemain = gesturPemain || "batu";
        }

        if (this.pilihanPemain === this.pilihanKomputer) {
          this.pemenang = "seri";
        } else {
          this.pemenang =
            ATURAN[this.pilihanPemain + "-" + this.pilihanKomputer] || "seri";
        }

        if (this.pemenang === "pemain") this.skorPemain++;
        else if (this.pemenang === "komputer") this.skorKomputer++;

        this.state = "RESULT";
        this._timerMulai = now;
      }
    } else if (this.state === "RESULT") {
      if (delta >= TIMER.COOLDOWN) {
        this.state = "READY";
      }
    }
  }

  sisaCountdown() {
    if (this.state === "COUNTDOWN") {
      const elapsed = Date.now() / 1000 - this._timerMulai;
      return Math.max(0, Math.ceil(TIMER.COUNTDOWN - elapsed));
    }
    return null;
  }

  sisaThrow() {
    if (this.state === "THROW") {
      const elapsed = Date.now() / 1000 - this._timerMulai;
      return Math.max(0, TIMER.THROW - elapsed);
    }
    return null;
  }
}

// === UI CONTROLLER ===
const engine = new GameEngine();

const el = (id) => document.getElementById(id);

function updateUI(gesturPemain) {
  const state = engine.state;
  el("score").textContent = `${engine.skorPemain} - ${engine.skorKomputer}`;

  if (state === "READY") {
    el("status").textContent = "Tekan MULAI untuk bermain";
    el("countdown").style.display = "none";
    el("choices").style.display = "none";
    el("result").style.display = "none";
  } else if (state === "COUNTDOWN") {
    const sisa = engine.sisaCountdown();
    el("countdown").style.display = "block";
    el("countdown").textContent = sisa;
    el("choices").style.display = "none";
    el("result").style.display = "none";
    el("status").textContent = sisa === 1 ? "SEKARANG!" : "TUNJUKKAN GESTUR ANDA...";
  } else if (state === "THROW") {
    const sisa = engine.sisaThrow();
    el("countdown").style.display = "none";
    el("status").textContent =
      sisa > 0 ? `Bekukan tangan... ${sisa.toFixed(1)}s` : "Memproses...";
    el("player-choice").textContent = engine.pilihanPemain
      ? `Kamu: ${engine.pilihanPemain}`
      : "";
    el("computer-choice").textContent = "";
    el("choices").style.display =
      engine.pilihanPemain ? "flex" : "none";
    el("result").style.display = "none";
  } else if (state === "RESULT") {
    el("status").textContent = "Hasil Babak";
    el("countdown").style.display = "none";
    el("player-choice").textContent = `Kamu: ${engine.pilihanPemain}`;
    el("computer-choice").textContent = `Komputer: ${engine.pilihanKomputer}`;
    el("choices").style.display = "flex";
    el("result").style.display = "block";

    const resultEl = el("result");
    if (engine.pemenang === "pemain") {
      resultEl.textContent = "KAMU MENANG!";
      resultEl.className = "menang";
    } else if (engine.pemenang === "komputer") {
      resultEl.textContent = "KOMPUTER MENANG!";
      resultEl.className = "kalah";
    } else {
      resultEl.textContent = "SERI!";
      resultEl.className = "seri";
    }
  }
}

// === GAME LOOP ===
let gesturSaatIni = null;

function loop() {
  engine.update(gesturSaatIni);
  updateUI(gesturSaatIni);
  requestAnimationFrame(loop);
}

// === EVENT BINDING ===
el("btn-mulai").addEventListener("click", () => {
  if (engine.state === "READY") {
    engine.mulaiBabak();
  }
});

el("btn-reset").addEventListener("click", () => {
  engine.reset();
});

// Mulai loop
loop();
