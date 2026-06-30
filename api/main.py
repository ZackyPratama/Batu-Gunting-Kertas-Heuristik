from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Gunting-Batu-Kertas Tanpa Sentuh")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


app.mount("/", StaticFiles(directory="public", html=True), name="public")
