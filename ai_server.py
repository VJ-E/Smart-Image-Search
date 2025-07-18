
import os
import torch
import numpy as np
from PIL import Image
import faiss
import open_clip
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import requests
from io import BytesIO

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# Configuration
TOP_K = 5
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MONGO_URL = os.getenv("MONGODB_URI")

# Load model and preprocessing
logger.info("Loading model...")
try:
    model, _, preprocess_val = open_clip.create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
    model.eval().to(DEVICE)
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    raise

# MongoDB connection
if not MONGO_URL:
    logger.error("MONGODB_URI environment variable not set")
    raise ValueError("MONGODB_URI environment variable not set")

try:
    logger.info("Connecting to MongoDB...")
    client = MongoClient(MONGO_URL)
    db = client.get_database("test")
    products_collection = db.get_collection("products")
    # Test connection
    client.server_info()
    logger.info("MongoDB connection successful.")
except Exception as e:
    logger.error(f"Error connecting to MongoDB: {e}")
    raise

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_embedding_from_url(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content)).convert("RGB")
        image_tensor = preprocess_val(image)
        image_tensor = image_tensor.unsqueeze(0).to(DEVICE)
        with torch.no_grad():
            embedding = model.encode_image(image_tensor)
            embedding /= embedding.norm(dim=-1, keepdim=True)
        return embedding.cpu().numpy()
    except Exception as e:
        print(f"Error processing image from {url}: {e}")
        return None

def get_embedding_from_upload(file):
    image = Image.open(file.file).convert("RGB")
    image_tensor = preprocess_val(image)
    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        embedding = model.encode_image(image_tensor)
        embedding /= embedding.norm(dim=-1, keepdim=True)
    return embedding.cpu().numpy()

@app.post("/find_similar_products")
async def find_similar_products(file: UploadFile = File(...)):
    # 1. Get all product image URLs from MongoDB
    print("Fetching product images from MongoDB...")
    all_products = list(products_collection.find({}))
    product_images = []
    for product in all_products:
        if product.get("image"):
            product_images.append({
                "product_id": str(product["_id"]),
                "image_url": product["image"][0]
            })

    # 2. Generate embeddings for all product images
    print("Generating embeddings for dataset...")
    dataset_embeddings = []
    valid_product_ids = []
    for item in product_images:
        embedding = get_embedding_from_url(item["image_url"])
        if embedding is not None:
            dataset_embeddings.append(embedding)
            valid_product_ids.append(item["product_id"])

    if not dataset_embeddings:
        return {"error": "Could not process any product images from the database."}

    dataset_embeddings = np.vstack(dataset_embeddings).astype(np.float32)

    # 3. FAISS indexing
    index = faiss.IndexFlatIP(dataset_embeddings.shape[1])
    index.add(dataset_embeddings)

    # 4. Get embedding for the uploaded image
    test_embedding = get_embedding_from_upload(file)
    test_embedding = np.asarray(test_embedding, dtype=np.float32).reshape(1, -1)

    # 5. Search for similar products
    distances, indices = index.search(test_embedding, TOP_K)
    similar_product_ids = [valid_product_ids[i] for i in indices[0]]

    return {"similar_product_ids": similar_product_ids}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
