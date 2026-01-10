from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routers import users, items, invoices, settings

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="RECO POS API")

# Allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(items.router)
app.include_router(invoices.router)
app.include_router(settings.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to RECO POS by Ailexity API"}
