from fastapi import APIRouter, FastAPI, HTTPException, Path
from pydantic import BaseModel, Field
from typing import List

item_router = APIRouter(tags=["Items"])

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


@item_router.post("/", response_model=Item)
def create_item(item: Item):
    if any(existing_item.id == item.id for existing_item in items):
        raise HTTPException(
            status_code=400, detail="Item with this ID already exists")
    items.append(item)
    return item

# Read (GET) - Get all items


@item_router.get("/", response_model=List[Item])
def get_items():
    return items

# Read (GET) - Get a specific item by ID


@item_router.get("/{item_id}", response_model=Item)
def get_item_by_id(item_id: int = Path(..., gt=0)):
    for item in items:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

# Update (PUT) - Update an item by ID


@item_router.put("/{item_id}", response_model=Item)
def update_item(item_id: int, updated_item: Item):
    for index, item in enumerate(items):
        if item.id == item_id:
            items[index] = updated_item
            return updated_item
    raise HTTPException(status_code=404, detail="Item not found")

# Delete (DELETE) - Remove an item by ID


@item_router.delete("/{item_id}")
def delete_item(item_id: int):
    for index, item in enumerate(items):
        if item.id == item_id:
            items.pop(index)
            return {"detail": "Item deleted"}
    raise HTTPException(status_code=404, detail="Item not found")
