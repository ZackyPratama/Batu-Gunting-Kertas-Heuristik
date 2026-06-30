# AGENTS.md — Gunting-Batu-Kertas Tanpa Sentuh

## Run

### Desktop (legacy)
```bash
.venv/Scripts/activate       # Windows venv
python game_cv.py            # main game
python test_gestur.py        # diagnostic: shows raw gesture name + confidence
```

### Web (development)
```bash
.venv/Scripts/activate
uvicorn api.main:app --reload --port 8000
# Buka http://localhost:8000
```

## Project structure

```
Computer-Vision/
├── api/
│   ├── __init__.py
│   └── main.py              # FastAPI app — /api/health
├── public/
│   ├── index.html            # Halaman game web
│   ├── style.css             # Dark theme styling
│   └── script.js             # Game engine + MediaPipe JS (WIP)
├── models/
│   └── gesture_recognizer.task   8MB — model ML
├── desktop/                  (belum ada — akan dipindah nanti)
├── game_cv.py                # Legacy desktop entrypoint
├── game_engine.py            # Legacy desktop state machine
├── ui_renderer.py            # Legacy desktop overlay
├── config.py                 # Legacy desktop constants
├── test_gestur.py            # Legacy desktop diagnostic
├── requirements.txt          # Python dependencies
├── vercel.json               # Vercel deploy config
└── AGENTS.md
```

## MediaPipe API (0.10.x) — Desktop

Uses `mediapipe.tasks.python.vision` — **NOT** `mp.solutions` (removed in v0.10).

Key classes: `GestureRecognizer`, `RunningMode.VIDEO`, `HandLandmarksConnections`, `drawing_utils`.

Raw gesture names: `Closed_Fist` → batu, `Open_Palm` → kertas, `Victory` → gunting.

## Web Migration — Architecture

| Layer | Teknologi | Deploy |
|-------|-----------|--------|
| Frontend | HTML + CSS + Vanilla JS + MediaPipe Tasks Vision JS | Vercel static |
| Backend | FastAPI (Python) | Vercel serverless |
| CV | Client-side (browser via MediaPipe JS) | — |

### Web Controls

| Tombol | Aksi |
|--------|------|
| MULAI | start round |
| Reset Skor | reset scores to 0-0 |

### Web State Machine

`READY → COUNTDOWN(3s) → THROW(1s) → RESULT(1.5s) → READY`

### Gesture Mapping (same as desktop)
`Closed_Fist` → batu, `Open_Palm` → kertas, `Victory` → gunting

## Deployment

```bash
vercel --prod
```

## Progress

- [x] Tahap 1: Setup — folder api/, public/, files dasar, vercel.json, requirements
- [x] Tahap 2: Port game_engine.py ke JS — class GameEngine + aturan menang
- [x] Tahap 3: MediaPipe JS — kamera + gesture detection
- [ ] Tahap 4: Integrasi engine + gesture + UI fungsional
- [ ] Tahap 5: FastAPI backend + deploy ke Vercel
- [ ] Tahap 6: Beautify — CSS polish + animasi

## Gotchas

- Model `models/gesture_recognizer.task` is not bundled — download if missing
- Web version requires HTTPS for camera access (Vercel auto)
- Camera 640x480, always flip horizontally for mirror effect
- No test framework, linter, or typechecker configured
- `script.js` uses ES Modules (`type="module"`) — requires modern browser, no IE support
- MediaPipe Tasks Vision JS loads WASM from CDN — requires internet connection at first load
- Model file must be inside `public/` directory for browser to access it
