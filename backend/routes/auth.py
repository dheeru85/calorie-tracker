from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from models.user import UserCreate, User, Token, UserUpdate
from services.auth_service import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, create_user, get_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from pymongo import MongoClient
import os

router = APIRouter()

def get_db():
    mongo_url = os.getenv("MONGO_URL")
    client = MongoClient(mongo_url)
    return client.calorie_tracker

@router.post("/register", response_model=dict)
async def register(user: UserCreate):
    db = get_db()
    
    # Check if user already exists
    if get_user(db, user.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create user
    user_data = user.dict()
    user_data["hashed_password"] = get_password_hash(user.password)
    del user_data["password"]
    
    new_user = create_user(db, user_data)
    if not new_user:
        raise HTTPException(
            status_code=500,
            detail="Could not create user"
        )
    
    return {"message": "User created successfully", "user_id": new_user.user_id}

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    db = get_db()
    
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    db = get_db()
    
    # Update user data
    update_data = user_update.dict(exclude_unset=True)
    if update_data:
        from datetime import datetime
        update_data["updated_at"] = datetime.utcnow()
        
        db.users.update_one(
            {"user_id": current_user.user_id},
            {"$set": update_data}
        )
    
    # Return updated user
    updated_user = get_user(db, current_user.username)
    return updated_user