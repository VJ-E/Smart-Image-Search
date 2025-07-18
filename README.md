# Smart Image Search

This project performs image similarity search using OpenCLIP and FAISS.

## Setup

1. Install dependencies:
```bash
   pip install -r requirements.txt
   ```
2. Place your dataset images in a folder named `dataset/` and your query/test images in a folder named `test/` in the project root. Supported formats: .png, .jpg, .jpeg

## Usage

Run the model script:
```bash
python model.py
```

The script will:
- Index all images in `dataset/`
- For each image in `test/`, find the top-5 most similar images from the dataset
- Display the results in a matplotlib window

## Notes
- GPU is used if available, otherwise CPU.
- You may need to install system dependencies for FAISS and OpenCLIP if not using a virtual environment.
