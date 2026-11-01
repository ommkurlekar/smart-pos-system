from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.database import get_db
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_stats(db: AsyncIOMotorDatabase = Depends(get_db)):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    month_start = today.replace(day=1)
    
    # Total sales today
    today_pipeline = [
        {"$match": {"timestamp": {"$gte": today}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    today_agg = await db["transactions"].aggregate(today_pipeline).to_list(1)
    today_sales = today_agg[0]["total"] if today_agg else 0.0

    # Monthly revenue
    month_pipeline = [
        {"$match": {"timestamp": {"$gte": month_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]
    month_agg = await db["transactions"].aggregate(month_pipeline).to_list(1)
    monthly_sales = month_agg[0]["total"] if month_agg else 0.0

    # Low stock
    low_stock = await db["products"].count_documents({"$expr": {"$lte": ["$stock_quantity", "$reorder_level"]}})

    # Total customers
    total_customers = await db["customers"].count_documents({})

    return {
        "today_sales": today_sales,
        "monthly_revenue": monthly_sales,
        "low_stock_count": low_stock,
        "total_customers": total_customers
    }

@router.get("/top-products")
async def get_top_products(db: AsyncIOMotorDatabase = Depends(get_db)):
    pipeline = [
        {"$unwind": "$items"},
        {"$group": {
            "_id": "$items.product_id",
            "total_qty": {"$sum": "$items.quantity"}
        }},
        {"$sort": {"total_qty": -1}},
        {"$limit": 5}
    ]
    
    items = await db["transactions"].aggregate(pipeline).to_list(5)
    
    top = []
    for item in items:
        # Product ID could be string or ObjectID depending on seed data
        from bson import ObjectId
        pid = item["_id"]
        try:
            query = {"_id": ObjectId(pid)} if len(str(pid)) == 24 else {"id": str(pid)}
        except:
            query = {"id": str(pid)}
            
        product = await db["products"].find_one(query)
        name = product["name"] if product else f"Product {pid}"
        
        top.append({"name": name, "quantity_sold": item["total_qty"]})
        
    return top

@router.get("/sales-trend")
async def get_sales_trend(db: AsyncIOMotorDatabase = Depends(get_db)):
    data = []
    for i in range(6, -1, -1):
        day_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        pipeline = [
            {"$match": {"timestamp": {"$gte": day_start, "$lt": day_end}}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]
        agg = await db["transactions"].aggregate(pipeline).to_list(1)
        daily_sales = agg[0]["total"] if agg else 0.0
        
        data.append({"date": day_start.strftime("%Y-%m-%d"), "sales": daily_sales})
        
    return data

@router.get("/low-stock")
async def get_low_stock(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["products"].find({"$expr": {"$lte": ["$stock_quantity", "$reorder_level"]}})
    products = await cursor.to_list(100)
    return [{"id": str(p["_id"]), "name": p["name"], "stock": p["stock_quantity"], "reorder_level": p.get("reorder_level", 10)} for p in products]

@router.get("/customer-lookup")
async def customer_lookup(phone: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Look up a customer by phone number and return CRM data for the Cashier."""
    customer = await db["customers"].find_one({"phone": phone})
    if not customer:
        return {"found": False, "phone": phone}

    # Determine segment label
    monetary = customer.get("monetary", 0)
    frequency = customer.get("frequency", 0)
    recency = customer.get("recency", 999)

    if frequency >= 5 and monetary >= 200:
        segment = "Loyal"
        segment_color = "#10b981"
    elif recency > 30:
        segment = "At-Risk"
        segment_color = "#ef4444"
    elif frequency <= 1:
        segment = "New"
        segment_color = "#6366f1"
    else:
        segment = "Regular"
        segment_color = "#f59e0b"

    # Get last transaction date
    last_tx = await db["transactions"].find_one(
        {"customer_id": str(customer["_id"])},
        sort=[("timestamp", -1)]
    )
    last_purchase = last_tx["timestamp"].strftime("%d %b %Y %H:%M") if last_tx else "N/A"

    return {
        "found": True,
        "phone": phone,
        "name": customer.get("name", f"Customer {phone[-4:]}"),
        "total_spent": round(monetary, 2),
        "visit_count": frequency,
        "segment": segment,
        "segment_color": segment_color,
        "last_purchase": last_purchase,
    }

@router.get("/segments-summary")
async def segments_summary(db: AsyncIOMotorDatabase = Depends(get_db)):
    """Return RFM segment counts for Manager dashboard pie chart."""
    cursor = db["customers"].find({})
    customers = await cursor.to_list(None)
    counts = {}
    for c in customers:
        seg = c.get("segment", "Unknown")
        counts[seg] = counts.get(seg, 0) + 1
    return [{"name": k, "value": v} for k, v in counts.items()]

