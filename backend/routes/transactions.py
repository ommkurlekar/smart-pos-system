from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.database import get_db
from backend import schemas
from datetime import datetime
from bson import ObjectId

router = APIRouter()

@router.post("/", response_model=schemas.TransactionResponse)
async def create_transaction(tx_data: schemas.TransactionCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    # 1. Deduct stock & calculate total
    total_amount = 0.0
    items_to_save = []
    
    for item in tx_data.items:
        # Avoid error if an ID is malformed ObjectId
        try:
           product_obj_id = ObjectId(item.product_id) if len(item.product_id) == 24 else item.product_id
        except:
           product_obj_id = item.product_id
           
        # If products rely on strictly ObjectIDs or string matching:
        product = await db["products"].find_one({"_id": product_obj_id})
        
        # fallback string search if needed:
        if not product:
            product = await db["products"].find_one({"id": str(item.product_id)})
            if not product:
                # since we're using mock products on frontend, let's gracefully fallback cost to 20 for mock
                product = {"price": 20.0, "stock_quantity": 100, "name": f"Mock_{item.product_id}"}
                
        if product.get('stock_quantity', 100) < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.get('name')}")
        
        if "_id" in product:
            await db["products"].update_one(
                {"_id": product["_id"]}, 
                {"$inc": {"stock_quantity": -item.quantity}}
            )
            
        total_amount += product.get("price", 0) * item.quantity
        items_to_save.append({
            "product_id": str(item.product_id),
            "quantity": item.quantity,
            "price_at_time": product.get("price", 0)
        })

    # 2. Update Customer RFM if phone exists
    customer_id = None
    if tx_data.customer_phone:
        customer = await db["customers"].find_one({"phone": tx_data.customer_phone})
        if not customer:
            result = await db["customers"].insert_one({
                "phone": tx_data.customer_phone, 
                "frequency": 1, 
                "monetary": total_amount, 
                "recency": 0
            })
            customer_id = str(result.inserted_id)
        else:
            await db["customers"].update_one(
                {"_id": customer["_id"]},
                {"$inc": {"frequency": 1, "monetary": total_amount}, "$set": {"recency": 0}}
            )
            customer_id = str(customer["_id"])

    # 3. Save Transaction
    tx_doc = {
        "customer_id": customer_id,
        "user_id": None, # Cashier context
        "total_amount": total_amount,
        "timestamp": datetime.utcnow(),
        "items": items_to_save
    }
    
    result = await db["transactions"].insert_one(tx_doc)

    return schemas.TransactionResponse(
        invoice_id=str(result.inserted_id),
        total_amount=total_amount,
        timestamp=tx_doc["timestamp"]
    )

@router.get("/recent")
async def recent_transactions(limit: int = 10, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return the most recent N transactions for the Cashier Shift Summary."""
    cursor = db["transactions"].find({}).sort("timestamp", -1).limit(limit)
    txs = await cursor.to_list(limit)
    result = []
    for tx in txs:
        result.append({
            "invoice_id": str(tx["_id"]),
            "timestamp": tx["timestamp"].isoformat() if tx.get("timestamp") else None,
            "total_amount": tx.get("total_amount", 0),
            "items_count": len(tx.get("items", [])),
            "payment_method": tx.get("payment_method", "cash"),
        })
    return result

@router.get("/shift-stats")
async def shift_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return today's shift KPIs for the Cashier dashboard."""
    from datetime import datetime
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    pipeline = [
        {"$match": {"timestamp": {"$gte": today}}},
        {"$group": {
            "_id": None,
            "total_revenue": {"$sum": "$total_amount"},
            "tx_count": {"$sum": 1},
            "avg_ticket": {"$avg": "$total_amount"},
        }}
    ]
    agg = await db["transactions"].aggregate(pipeline).to_list(1)
    if agg:
        return {
            "tx_count": agg[0]["tx_count"],
            "total_revenue": round(agg[0]["total_revenue"], 2),
            "avg_ticket": round(agg[0]["avg_ticket"], 2),
            "returns": 0,
        }
    return {"tx_count": 0, "total_revenue": 0.0, "avg_ticket": 0.0, "returns": 0}

