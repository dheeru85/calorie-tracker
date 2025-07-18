from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from routes import auth, food, diary
from services.auth_service import get_current_user

load_dotenv()

app = FastAPI(title="Calorie Tracker API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
mongo_url = os.getenv("MONGO_URL")
client = MongoClient(mongo_url)
db = client.calorie_tracker

# Make db available to routes
app.state.db = db

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(food.router, prefix="/api/food", tags=["food"])
app.include_router(diary.router, prefix="/api/diary", tags=["diary"])

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Calorie Tracker API is running"}

@app.get("/api/protected")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello {current_user['username']}, this is a protected route!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)