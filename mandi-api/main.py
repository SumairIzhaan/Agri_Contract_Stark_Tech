from fastapi import FastAPI
from datetime import datetime
from typing import Optional
import random

app = FastAPI(title="Nagpur Mandi Live Prices")

# Sample Nagpur fruit/veg prices (₹/Quintal)
nagpur_prices = {
    "fruits": [
        {"name": "Banana", "modal": 40, "min": 30, "max": 50, "arrivals": 4500},
        {"name": "Orange", "modal": 2800, "min": 2600, "max": 3000, "arrivals": 3200},
        {"name": "Strawberry", "modal": 100, "min": 50, "max": 140, "arrivals": 1800},
        {"name": "Apple", "modal": 180, "min": 140, "max": 200, "arrivals": 1200}
    ],
    "vegetables": [
        {"name": "Onion", "modal": 32, "min": 30, "max": 34, "arrivals": 2500},
        {"name": "Tomato", "modal": 28, "min": 26, "max": 30, "arrivals": 3800},
        {"name": "Potato", "modal": 30, "min": 28, "max": 35, "arrivals": 5200},
        {"name": "Bhindi", "modal": 12, "min": 10, "max": 15, "arrivals": 1500}
    ]
}

@app.get("/")
def home():
    return {"message": "Nagpur Mandi Live Prices API", "timestamp": datetime.now()}

@app.get("/api/prices")
def get_all_prices():
    return {
        "mandi": "Nagpur",
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        **nagpur_prices
    }

@app.get("/api/prices/fruits")
def get_fruit_prices():
    return {"category": "Fruits", "data": nagpur_prices["fruits"]}

@app.get("/api/prices/vegetables")
def get_veg_prices():
    return {"category": "Vegetables", "data": nagpur_prices["vegetables"]}

@app.get("/api/price/{commodity}")
def get_price(commodity: str):
    for category in nagpur_prices.values():
        for item in category:
            if item["name"].lower() == commodity.lower():
                item["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M")
                return item
    return {"error": "Commodity not found"}

@app.get("/api/search")
def search_prices(q: str):
    results = []
    for category, items in nagpur_prices.items():
        for item in items:
            if q.lower() in item["name"].lower():
                results.append(item)
    return {"query": q, "results": results}
