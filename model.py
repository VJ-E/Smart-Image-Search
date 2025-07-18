import os
import torch
import numpy as np
from PIL import Image
import faiss
import matplotlib.pyplot as plt
from open_clip import create_model_and_transforms

# Workaround for OpenMP runtime conflict
# This sets KMP_DUPLICATE_LIB_OK=TRUE to allow multiple OpenMP runtimes, but may cause performance issues or incorrect results.
# For more information, see http://openmp.llvm.org/
os.environ['KMP_DUPLICATE_LIB_OK'] = 'TRUE'

# Configuration
DATASET_FOLDER = "dataset"
TEST_FOLDER = "test"
TOP_K = 5
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Load model and preprocessing
print("Loading model...")
model, _, preprocess_val = create_model_and_transforms('ViT-B-32', pretrained='laion2b_s34b_b79k')
model.eval().to(DEVICE)

# Helper: Extract image embeddings
def get_embedding(image_path):
    image = Image.open(image_path).convert("RGB")
    image_tensor: torch.Tensor = preprocess_val(image)  # type: ignore
    image_tensor = image_tensor.unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        embedding = model.encode_image(image_tensor)
        embedding /= embedding.norm(dim=-1, keepdim=True)
    return embedding.cpu().numpy()

# Step 1: Index dataset images
print("Indexing dataset images...")
dataset_paths = [os.path.join(DATASET_FOLDER, f) for f in os.listdir(DATASET_FOLDER) if f.lower().endswith((".png", ".jpg", ".jpeg"))]
dataset_embeddings = np.vstack([get_embedding(p) for p in dataset_paths]).astype(np.float32)

# FAISS indexing
index = faiss.IndexFlatIP(dataset_embeddings.shape[1])  # Cosine similarity (dot product on normalized vectors)
index.add(dataset_embeddings)

# Step 2: Search for each test image and collect results
results = []
test_paths = [os.path.join(TEST_FOLDER, f) for f in os.listdir(TEST_FOLDER) if f.lower().endswith((".png", ".jpg", ".jpeg"))]

for test_path in test_paths:
    test_embedding = get_embedding(test_path)
    test_embedding = np.asarray(test_embedding, dtype=np.float32).reshape(1, -1)
    distances, indices = index.search(test_embedding, TOP_K)
    similar_paths = [dataset_paths[i] for i in indices[0]]
    results.append((test_path, similar_paths))

# Show all queries and matches in a single page
num_tests = len(results)
fig, axs = plt.subplots(num_tests, TOP_K + 1, figsize=(4 * (TOP_K + 1), 4 * num_tests))

if num_tests == 1:
    axs = [axs]  # Ensure axs is always a list of lists

for row, (test_path, similar_paths) in enumerate(results):
    # Show query image
    axs[row][0].imshow(Image.open(test_path))
    axs[row][0].set_title("Query")
    axs[row][0].axis("off")
    # Show matches
    for col, sim_path in enumerate(similar_paths):
        axs[row][col + 1].imshow(Image.open(sim_path))
        axs[row][col + 1].set_title(f"Match {col+1}")
        axs[row][col + 1].axis("off")

plt.tight_layout()
# plt.show()  # Comment out interactive show
plt.savefig("results/results.png")
print("Results saved to results.png")
