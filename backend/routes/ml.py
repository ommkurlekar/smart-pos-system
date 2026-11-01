from fastapi import APIRouter, Depends, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.database import get_db
from backend import schemas
from backend.services.forecast_service import predict_demand
from backend.services.segmentation_service import get_customer_segments
from backend.services.recommendation_service import recommend_products
from datetime import datetime, timedelta
import random
from pydantic import BaseModel

router = APIRouter()

class UpdateCustomerRequest(BaseModel):
    name: str
    phone: str

@router.post("/predict-demand")
async def predict(req: schemas.PredictDemandRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    start_date = datetime.utcnow() - timedelta(days=30)
    
    daily_sales = [0] * 30
    
    pipeline = [
        {"$match": {"timestamp": {"$gte": start_date}}},
        {"$unwind": "$items"},
        {"$match": {"items.product_id": req.product_id}}
    ]
    
    tx_items = await db["transactions"].aggregate(pipeline).to_list(length=None)
    
    for item in tx_items:
        day_diff = (item["timestamp"] - start_date).days
        if 0 <= day_diff < 30:
            daily_sales[day_diff] += item["items"]["quantity"]
            
    if sum(daily_sales) == 0:
        daily_sales = [int(10 + i * 0.5) for i in range(30)] # simulated past 30 days if no data
            
    result = predict_demand(int(req.product_id) if str(req.product_id).isdigit() else 1, daily_sales)
    return result

@router.get("/customer-segments")
async def get_segments(db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["customers"].find({})
    customers = await cursor.to_list(length=None)
    
    c_data = [{"id": str(c["_id"]), "recency": c.get("recency", 0), "frequency": c.get("frequency", 0), "monetary": c.get("monetary", 0), "phone": c.get("phone"), "name": c.get("name")} for c in customers]
    
    segmented_data = get_customer_segments(c_data)
    
    from bson import ObjectId
    for data in segmented_data:
        await db["customers"].update_one(
            {"_id": ObjectId(data["id"])},
            {"$set": {"segment": data["segment"]}}
        )
    
    cluster_counts = {}
    for d in segmented_data:
        cluster_counts[d["segment"]] = cluster_counts.get(d["segment"], 0) + 1
        
    return {
        "raw_data": segmented_data,
        "summary": [{"name": k, "value": v} for k, v in cluster_counts.items()]
    }

@router.post("/recommend")
async def recommend(req: schemas.RecommendRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    # Standard format all transactions bridging for older sync service layout:
    # (Since recommend_products uses objects, we need to mock or map them)
    
    all_tx_docs = await db["transactions"].find({}).to_list(length=None)
    all_prods = await db["products"].find({}).to_list(length=None)
    
    class DummyTx: pass
    class DummyItem: pass
    class DummyProduct: pass
    
    all_transactions = []
    for t in all_tx_docs:
        dtx = DummyTx()
        dtx.items = []
        for i in t.get("items", []):
            di = DummyItem()
            di.product_id = i["product_id"]
            dtx.items.append(di)
        all_transactions.append(dtx)
        
    all_products = []
    for p in all_prods:
        dp = DummyProduct()
        dp.id = str(p["_id"])
        dp.name = p["name"]
        dp.price = p["price"]
        all_products.append(dp)
    
    recs = recommend_products(req.product_ids, all_transactions, all_products)
    
    if not recs and len(all_products) > 0:
        rand_prods = random.sample(all_products, min(3, len(all_products)))
        recs = [{"id": p.id, "name": p.name, "price": p.price, "confidence": round(random.uniform(0.3, 0.9), 2)} for p in rand_prods if p.id not in req.product_ids]

    return {"recommended_products": recs[:3]}

@router.get("/forecast-report")
async def get_forecast_report(format: str = "json", db: AsyncIOMotorDatabase = Depends(get_db)):
    products_cursor = db["products"].find({})
    products = await products_cursor.to_list(length=None)
    
    products_report_data = []
    start_date = datetime.utcnow() - timedelta(days=30)
    
    for p in products:
        pid = str(p["_id"])
        
        # Calculate daily sales for the past 30 days
        pipeline = [
            {"$match": {"timestamp": {"$gte": start_date}}},
            {"$unwind": "$items"},
            {"$match": {"items.product_id": pid}}
        ]
        tx_items = await db["transactions"].aggregate(pipeline).to_list(length=None)
        
        daily_sales = [0] * 30
        for item in tx_items:
            # Check for timestamp presence
            if not item.get("timestamp"):
                continue
            day_diff = (item["timestamp"] - start_date).days
            if 0 <= day_diff < 30:
                daily_sales[day_diff] += item["items"]["quantity"]
                
        if sum(daily_sales) == 0:
            # Fallback mock sales based on product index or random
            daily_sales = [int(5 + (i % 5)) for i in range(30)]
            
        # Run forecast
        result = predict_demand(1, daily_sales)
        pred_qty = result.get("predicted_quantity", 0.0)
        
        # Calculate trend
        first_half = sum(daily_sales[:15])
        second_half = sum(daily_sales[15:])
        if second_half > first_half * 1.05:
            sales_trend = "Increasing"
        elif second_half < first_half * 0.95:
            sales_trend = "Decreasing"
        else:
            sales_trend = "Stable"
            
        # Reorder Recommendation
        stock = p.get("stock_quantity", 0)
        reorder_level = p.get("reorder_level", 10)
        if stock <= reorder_level:
            reorder_rec = "Immediate Restock"
        elif stock <= reorder_level + pred_qty * 0.5:
            reorder_rec = "Restock Recommended"
        else:
            reorder_rec = "Fully Stocked"
            
        # Demand status
        if pred_qty > 25:
            demand_status = "High"
        elif pred_qty > 10:
            demand_status = "Medium"
        else:
            demand_status = "Low"
            
        products_report_data.append({
            "id": pid,
            "name": p.get("name", "N/A"),
            "category": p.get("category", "N/A"),
            "stock": stock,
            "reorder_level": reorder_level,
            "predicted_demand": pred_qty,
            "sales_trend": sales_trend,
            "reorder_recommendation": reorder_rec,
            "demand_status": demand_status
        })

    if format == "json":
        return products_report_data
        
    from backend.services.report_service import generate_forecast_report
    file_bytes = generate_forecast_report(products_report_data, format)
    
    if format == "csv":
        return Response(content=file_bytes, media_type="text/csv", headers={"Content-Disposition": "attachment;filename=demand_forecast_report.csv"})
    elif format == "excel":
        return Response(content=file_bytes, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment;filename=demand_forecast_report.xlsx"})
    elif format == "pdf":
        return Response(content=file_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment;filename=demand_forecast_report.pdf"})

@router.get("/customer-report")
async def get_customer_report_endpoint(format: str = "json", db: AsyncIOMotorDatabase = Depends(get_db)):
    cursor = db["customers"].find({})
    customers = await cursor.to_list(length=None)
    
    c_data = []
    for c in customers:
        c_data.append({
            "id": str(c["_id"]),
            "name": c.get("name") or f"Customer {str(c['_id'])[-4:]}",
            "phone": c.get("phone", ""),
            "frequency": c.get("frequency", 0),
            "monetary": c.get("monetary", 0.0),
            "segment": c.get("segment") or "New"
        })
        
    if format == "json":
        return c_data
        
    from backend.services.report_service import generate_customer_report
    file_bytes = generate_customer_report(c_data, format)
    
    if format == "csv":
        return Response(content=file_bytes, media_type="text/csv", headers={"Content-Disposition": "attachment;filename=customer_segmentation_report.csv"})
    elif format == "excel":
        return Response(content=file_bytes, media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", headers={"Content-Disposition": "attachment;filename=customer_segmentation_report.xlsx"})
    elif format == "pdf":
        return Response(content=file_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment;filename=customer_segmentation_report.pdf"})

@router.get("/customer-card/{customer_id}")
async def get_customer_card(customer_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    from bson import ObjectId
    try:
        query = {"_id": ObjectId(customer_id)}
    except:
        return Response(content="Invalid customer ID", status_code=400)
        
    customer = await db["customers"].find_one(query)
    if not customer:
        return Response(content="Customer not found", status_code=404)
        
    c_data = {
        "id": str(customer["_id"]),
        "name": customer.get("name") or f"Customer {str(customer['_id'])[-4:]}",
        "phone": customer.get("phone", ""),
        "frequency": customer.get("frequency", 0),
        "monetary": customer.get("monetary", 0.0),
        "segment": customer.get("segment") or "New"
    }
    
    from backend.services.report_service import generate_customer_card_pdf
    pdf_bytes = generate_customer_card_pdf(c_data)
    
    return Response(
        content=pdf_bytes, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment;filename=customer_card_{customer_id[-6:]}.pdf"}
    )

@router.put("/customers/{customer_id}")
async def update_customer(customer_id: str, req: UpdateCustomerRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    from bson import ObjectId
    try:
        query = {"_id": ObjectId(customer_id)}
    except:
        return {"error": "Invalid customer ID"}
        
    # Check if phone is in use by another customer
    existing = await db["customers"].find_one({"phone": req.phone, "_id": {"$ne": ObjectId(customer_id)}})
    if existing:
        return {"error": "Phone number is already in use by another customer"}
        
    await db["customers"].update_one(
        query,
        {"$set": {"name": req.name, "phone": req.phone}}
    )
    return {"message": "Customer updated successfully"}

