from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    role: str # "Manager" or "Cashier"

class UserResponse(BaseModel):
    id: str
    username: str
    role: str
