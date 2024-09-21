import coverage
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List

# Start coverage monitoring
cov = coverage.Coverage()
cov.start()

app = FastAPI()

# Define a simple model for our data
class Item(BaseModel):
    id: int
    name: str
    description: str = None
    price: float
    tax: float = None

# In-memory "database"
items = []

# Create (POST) - Add a new item
@app.post("/items/", response_model=Item)
def create_item(item: Item):
    items.append(item)
    return item

# Read (GET) - Get all items
@app.get("/items/", response_model=List[Item])
def get_items():
    return items

# Read (GET) - Get a specific item by ID
@app.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

# Update (PUT) - Update an item by ID
@app.put("/items/{item_id}", response_model=Item)
def update_item(item_id: int, updated_item: Item):
    for index, item in enumerate(items):
        if item.id == item_id:
            items[index] = updated_item
            return updated_item
    raise HTTPException(status_code=404, detail="Item not found")

# Delete (DELETE) - Remove an item by ID
@app.delete("/items/{item_id}")
def delete_item(item_id: int):
    for index, item in enumerate(items):
        if item.id == item_id:
            items.pop(index)
            return {"detail": "Item deleted"}
    raise HTTPException(status_code=404, detail="Item not found")


@app.on_event("shutdown")
def shutdown_event():
    cov.stop()
    cov.save()