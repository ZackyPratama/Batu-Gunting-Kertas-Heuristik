from fastapi import FastAPI

app = FastAPI(title="Gunting-Batu-Kertas Tanpa Sentuh")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
