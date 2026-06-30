import { FilesetResolver, GestureRecognizer } from
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18";

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

const EMOJI = { batu: "✊", kertas: "✋", gunting: "✌️" };

const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

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

const engine = new GameEngine();
const el = (id) => document.getElementById(id);
const kontainer = el("game-container");

function updateUI(gesturPemain) {
  const state = engine.state;
  el("score").textContent = `${engine.skorPemain} - ${engine.skorKomputer}`;
  el("babak").textContent = engine.babak ? `Babak ${engine.babak}` : "";

  const teksGestur = gesturPemain ? ` (${gesturPemain})` : "";
  const btnMulai = el("btn-mulai");

  if (state === "READY") {
    el("status").textContent = "Tekan MULAI untuk bermain" + teksGestur;
    el("countdown").style.display = "none";
    el("choices").style.display = "none";
    el("choices").classList.remove("show");
    el("result").style.display = "none";
    el("result").classList.remove("show");
    kontainer.classList.remove("running");
    btnMulai.disabled = false;
  } else if (state === "COUNTDOWN") {
    const sisa = engine.sisaCountdown();
    el("countdown").style.display = "block";
    el("countdown").textContent = sisa;
    el("countdown").classList.remove("pop");
    void el("countdown").offsetWidth;
    el("countdown").classList.add("pop");
    el("choices").style.display = "none";
    el("choices").classList.remove("show");
    el("result").style.display = "none";
    el("result").classList.remove("show");
    el("status").textContent =
      (sisa === 1 ? "SEKARANG!" : "TUNJUKKAN GESTUR ANDA...") + teksGestur;
    kontainer.classList.add("running");
    btnMulai.disabled = true;
  } else if (state === "THROW") {
    const sisa = engine.sisaThrow();
    el("countdown").style.display = "none";
    el("countdown").classList.remove("pop");
    el("status").textContent =
      sisa > 0 ? `Bekukan tangan... ${sisa.toFixed(1)}s` : "Memproses...";
    el("choices").style.display = engine.pilihanPemain ? "flex" : "none";
    if (engine.pilihanPemain) {
      const emoji = EMOJI[engine.pilihanPemain] || "";
      el("player-choice").innerHTML =
        `<span class="gesture-emoji">${emoji}</span>Kamu: ${engine.pilihanPemain}`;
      el("choices").classList.add("show");
    }
    el("computer-choice").textContent = "";
    el("result").style.display = "none";
    el("result").classList.remove("show");
    btnMulai.disabled = true;
  } else if (state === "RESULT") {
    el("status").textContent = "Hasil Babak";
    el("countdown").style.display = "none";
    el("countdown").classList.remove("pop");

    const emojiP = EMOJI[engine.pilihanPemain] || "";
    const emojiK = EMOJI[engine.pilihanKomputer] || "";
    el("player-choice").innerHTML =
      `<span class="gesture-emoji">${emojiP}</span>Kamu: ${engine.pilihanPemain}`;
    el("computer-choice").innerHTML =
      `<span class="gesture-emoji">${emojiK}</span>Komputer: ${engine.pilihanKomputer}`;
    el("choices").style.display = "flex";
    el("choices").classList.add("show");

    const resultEl = el("result");
    if (engine.pemenang === "pemain") {
      resultEl.textContent = "KAMU MENANG!";
      resultEl.className = "menang show";
    } else if (engine.pemenang === "komputer") {
      resultEl.textContent = "KOMPUTER MENANG!";
      resultEl.className = "kalah show";
    } else {
      resultEl.textContent = "SERI!";
      resultEl.className = "seri show";
    }

    el("score").classList.remove("pop");
    void el("score").offsetWidth;
    el("score").classList.add("pop");
    btnMulai.disabled = true;
  }
}

function drawHandLandmarks(ctx, landmarks, w, h) {
  const color = (r, g, b) => `rgb(${r},${g},${b})`;

  for (const [i, j] of HAND_CONNECTIONS) {
    const a = landmarks[i];
    const b = landmarks[j];
    ctx.beginPath();
    ctx.moveTo(a.x * w, a.y * h);
    ctx.lineTo(b.x * w, b.y * h);
    ctx.strokeStyle = color(0, 255, 0);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  for (const lm of landmarks) {
    ctx.beginPath();
    ctx.arc(lm.x * w, lm.y * h, 5, 0, 2 * Math.PI);
    ctx.fillStyle = color(255, 0, 0);
    ctx.fill();
  }
}

let recognizer = null;
let siap = false;

async function init() {
  try {
    el("status").textContent = "Memuat model...";

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
    );

    recognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: { modelAssetPath: "models/gesture_recognizer.task" },
      runningMode: "VIDEO",
      numHands: 1,
      minHandDetectionConfidence: 0.7,
    });

    el("status").textContent = "Mengaktifkan kamera...";

    const video = el("webcam");
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: "user" },
    });
    video.srcObject = stream;

    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        video.play();
        resolve();
      };
    });

    const canvas = el("overlay");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    siap = true;
    el("status").textContent = "Tekan MULAI untuk bermain";

    requestAnimationFrame(loop);
  } catch (err) {
    if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
      el("status").textContent = "Akses kamera ditolak. Izinkan kamera di browser.";
    } else if (err.name === "NotFoundError") {
      el("status").textContent = "Kamera tidak ditemukan.";
    } else {
      el("status").textContent = "Gagal: " + err.message;
    }
    console.error(err);
  }
}

function loop() {
  const video = el("webcam");
  const canvas = el("overlay");
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let gesturPemain = null;

  if (siap && video.readyState >= 2) {
    try {
      const ts = performance.now();
      const result = recognizer.recognizeForVideo(video, ts);

      if (result.gestures && result.gestures.length > 0) {
        const nama = result.gestures[0][0].categoryName;
        gesturPemain = MAPPING_GESTUR[nama] || null;
      }

      if (result.handLandmarks && result.handLandmarks.length > 0) {
        drawHandLandmarks(ctx, result.handLandmarks[0], canvas.width, canvas.height);
      }
    } catch (_) {}
  }

  engine.update(gesturPemain);
  updateUI(gesturPemain);

  requestAnimationFrame(loop);
}

el("btn-mulai").addEventListener("click", () => {
  if (engine.state === "READY") engine.mulaiBabak();
});

el("btn-reset").addEventListener("click", () => {
  engine.reset();
  el("score").classList.remove("pop");
  el("babak").textContent = "";
  el("btn-mulai").disabled = false;
  kontainer.classList.remove("running");
});

init();
