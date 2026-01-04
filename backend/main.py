from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models, database
from routers import users, items, invoices

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="RECO POS API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(items.router)
app.include_router(invoices.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to RECO POS by Ailexity API"}
