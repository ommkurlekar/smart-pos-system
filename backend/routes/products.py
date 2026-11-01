from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from backend.database import get_db
from backend import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
async def get_products(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["products"].find({})
    products = await cursor.to_list(length=1000)
    # Convert _id to id for client
    result = []
    for p in products:
        p["id"] = str(p["_id"])
        result.append(p)
    return result
