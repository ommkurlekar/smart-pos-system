from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
class ProductBase(BaseModel):
    name: str
    category: str
    price: float
    stock_quantity: int
    reorder_level: int = 10

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: Optional[str] = Field(alias="_id", default=None)
    
    model_config = ConfigDict(populate_by_name=True)

class CustomerData(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    phone: str
    name: Optional[str] = None
    recency: float = 0.0
    frequency: int = 0
    monetary: float = 0.0
    segment: Optional[str] = None
    model_config = ConfigDict(populate_by_name=True)

class TransactionItemCreate(BaseModel):
    product_id: str
    quantity: int

class TransactionItemModel(BaseModel):
    product_id: str
    quantity: int
    price_at_time: float

class TransactionCreate(BaseModel):
    customer_phone: Optional[str] = None
    payment_method: Optional[str] = "cash"
    note: Optional[str] = None
    items: List[TransactionItemCreate]

class TransactionResponse(BaseModel):
    invoice_id: str
    total_amount: float
    timestamp: datetime
    
    model_config = ConfigDict(populate_by_name=True)

class PredictDemandRequest(BaseModel):
    product_id: str

class RecommendRequest(BaseModel):
    product_ids: List[str]

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
