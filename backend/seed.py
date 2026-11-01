import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import random

MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME = "smartpos"

client = AsyncIOMotorClient(MONGO_URL)
db = client[DATABASE_NAME]

async def seed_data():
    # Clear existing data
    await db.users.delete_many({})
    await db.products.delete_many({})
    await db.customers.delete_many({})
    await db.transactions.delete_many({})

    # Users (Hashed passwords for 'manager@gmail.com' and 'store@gmail.com')
    # Using a simple pre-hashed bcrypt for 'manager@gmail.com' and 'store@gmail.com'
    # For simplicity, we'll use the auth route logic if possible, but here we just insert.
    # $2b$12$7kP.Hk4n6.Q.Q.Q.Q.Q.Q.O.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q.Q
    # Actually I'll just use a mock hash or install bcrypt in venv to hash it correctly.
    # I already installed passlib which should have bcrypt.
    import bcrypt
    def get_password_hash(password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    users = [
        {"username": "manager@gmail.com", "password_hash": get_password_hash("manager@gmail.com"), "role": "Manager"},
        {"username": "store@gmail.com", "password_hash": get_password_hash("store@gmail.com"), "role": "Cashier"}
    ]
    await db.users.insert_many(users)

    # Products
    mock_products = [
        {"name": "Wireless Mouse", "category": "Electronics", "price": 29.99, "stock_quantity": 45, "reorder_level": 10},
        {"name": "Mechanical Keyboard", "category": "Electronics", "price": 89.99, "stock_quantity": 12, "reorder_level": 15},
        {"name": "HD Monitor 24inch", "category": "Electronics", "price": 149.99, "stock_quantity": 8, "reorder_level": 10},
        {"name": "USB-C Hub", "category": "Accessories", "price": 34.99, "stock_quantity": 20, "reorder_level": 10},
        {"name": "Mousepad Large", "category": "Accessories", "price": 15.99, "stock_quantity": 50, "reorder_level": 20},
        {"name": "Noise Cancelling Headphones", "category": "Audio", "price": 199.99, "stock_quantity": 15, "reorder_level": 5}
    ]
    
    prod_result = await db.products.insert_many(mock_products)
    product_ids = prod_result.inserted_ids

    # Customers
    mock_customers = []
    for i in range(10):
        mock_customers.append({
            "phone": f"123-456-789{i}",
            "name": f"Customer {i}",
            "recency": random.uniform(1, 30),
            "frequency": random.randint(1, 10),
            "monetary": random.uniform(20.0, 500.0)
        })
    cust_result = await db.customers.insert_many(mock_customers)
    customer_ids = cust_result.inserted_ids

    # Transactions
    txs = []
    for _ in range(30):
        # random date in last 30 days
        days_ago = random.randint(0, 30)
        tx_date = datetime.utcnow() - timedelta(days=days_ago)
        
        num_items = random.randint(1, 4)
        selected_prods = random.sample(product_ids, num_items)
        items = []
        total = 0
        for pid in selected_prods:
            qty = random.randint(1, 3)
            # Find price
            price = next(p["price"] for p in mock_products if p["name"] == "Wireless Mouse") # Mock lookup
            items.append({
                "product_id": str(pid),
                "quantity": qty,
                "price_at_time": price
            })
            total += price * qty
            
        txs.append({
            "customer_id": str(random.choice(customer_ids)),
            "user_id": None,
            "total_amount": total,
            "timestamp": tx_date,
            "items": items
        })
        
    await db.transactions.insert_many(txs)
    print("Database seeded with sample data successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
