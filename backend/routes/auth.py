from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.database import get_db
from backend import schemas, schemas_auth
import bcrypt
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()
SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-key-for-smart-pos")
ALGORITHM = "HS256"

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=1440) # 24 hours
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/signup", response_model=schemas_auth.UserResponse)
async def signup(user: schemas_auth.UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    existing_user = await db["users"].find_one({"username": user.username})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
        
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "username": user.username,
        "password_hash": hashed_password,
        "role": user.role
    }
    
    result = await db["users"].insert_one(user_doc)
    return {"id": str(result.inserted_id), "username": user.username, "role": user.role}

@router.post("/login")
async def login(login_data: schemas.UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    user = await db["users"].find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")
        
    access_token = create_access_token(data={"sub": user["username"], "role": user["role"]})
    return {"access_token": access_token, "role": user["role"]}

