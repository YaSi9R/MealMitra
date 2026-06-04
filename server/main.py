from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json

app = FastAPI(title="Smart Food Distribution AI")

with open("food_expiry.json", "r") as f:
    FOOD_DB = json.load(f)

class FoodItem(BaseModel):
    name: str
    quantity_kg: float
    cooked_hours_ago: float

class NGO(BaseModel):
    ngo_name: str
    distance_km: float
    max_capacity_kg: float

class DistributionRequest(BaseModel):
    food_items: List[FoodItem]
    ngos: List[NGO]

# calculating food score based on how much time needed to expire

def calculate_food_remaining(food_item):

    food_name = food_item.name.lower()

    if food_name not in FOOD_DB:
        return {
            "food": food_name,
            "status": "unknown_food"
        }

    expiry_hours = FOOD_DB[food_name]["expiry_hours"]

    remaining_hours = expiry_hours - food_item.cooked_hours_ago

    if remaining_hours <= 0:
        status = "expired"
        urgency_score = 100
    elif remaining_hours <= 2:
        status = "critical"
        urgency_score = 90
    elif remaining_hours <= 5:
        status = "urgent"
        urgency_score = 70
    else:
        status = "safe"
        urgency_score = 40

    return {
        "food": food_name,
        "expiry_hours": expiry_hours,
        "cooked_hours_ago": food_item.cooked_hours_ago,
        "remaining_hours": round(remaining_hours, 2),
        "status": status,
        "urgency_score": urgency_score
    }

# we calculate ngo based on the time remaining for the food so it can reahc safely to the ngo before expiring
def calculate_ngo_score(ngo, total_qty, avg_remaining_time):

    score = 0

    if ngo.distance_km <= 5:
        score += 50
    elif ngo.distance_km <= 15:
        score += 30
    else:
        score += 10

    if ngo.max_capacity_kg >= total_qty:
        score += 40
    else:
        score -= 30

    if avg_remaining_time <= 2:
        score += max(0, 30 - ngo.distance_km)

    return score

# food items url
@app.post("/smart-distribute")
def smart_distribute(data: DistributionRequest):

    results = []

    total_qty = 0
    total_remaining_time = 0

    for item in data.food_items:

        analysis = calculate_food_remaining(item)

        results.append(analysis)

        total_qty += item.quantity_kg

        if "remaining_hours" in analysis:
            total_remaining_time += max(
                analysis["remaining_hours"], 0
            )

    avg_remaining_time = total_remaining_time / len(data.food_items)

    ngo_scores = []

    for ngo in data.ngos:

        score = calculate_ngo_score(
            ngo,
            total_qty,
            avg_remaining_time
        )

        ngo_scores.append({
            "ngo_name": ngo.ngo_name,
            "score": score
        })

    ngo_scores.sort(
        key=lambda x: x["score"],
        reverse=True
    )

    return {
        "food_analysis": results,
        "total_food_quantity": total_qty,
        "average_remaining_hours": round(avg_remaining_time, 2),
        "recommended_ngo": ngo_scores[0],
        "all_ngo_scores": ngo_scores
    }

@app.get("/")
def home():
    return {
        "message": "Smart Food Distribution AI Running"
    }