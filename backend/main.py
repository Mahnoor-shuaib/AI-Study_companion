from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from chunking import chunk_text
from embeddings import get_embedding
from qdrant_client_setup import create_collection_if_not_exists, store_chunks, search_chunks, search_chunks_with_scores
from study_plan import generate_study_plan
from file_reader import extract_text

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "Study Companion backend is running!"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return {"filename": file.filename, "message": "File uploaded successfully"}

@app.post("/test-chunk")
async def test_chunk(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")
    chunks = chunk_text(text)
    return {"total_chunks": len(chunks), "chunks": chunks}

@app.post("/test-embedding")
async def test_embedding(file: UploadFile = File(...)):
    content = await file.read()
    text = content.decode("utf-8")
    chunks = chunk_text(text)
    first_embedding = get_embedding(chunks[0])
    return {
        "total_chunks": len(chunks),
        "embedding_length": len(first_embedding),
        "sample_values": first_embedding[:5]
    }

@app.post("/setup-collection")
def setup_collection():
    create_collection_if_not_exists()
    return {"message": "Collection ready"}

@app.post("/store-document")
async def store_document(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    text = extract_text(file_path)
    chunks = chunk_text(text)
    embeddings = [get_embedding(chunk) for chunk in chunks]
    store_chunks(chunks, embeddings)
    return {"message": "Document stored successfully", "total_chunks": len(chunks)}

@app.get("/search")
def search(query: str):
    results = search_chunks(query)
    return {"query": query, "results": results}

@app.get("/search-scores")
def search_scores(query: str):
    results = search_chunks_with_scores(query)
    return {"query": query, "results": results}

@app.get("/study-plan")
def study_plan(topic: str):
    chunks = search_chunks(topic)
    if not chunks:
        raise HTTPException(
            status_code=404,
            detail="Your notes don't seem to cover this topic. Try a topic from your uploaded files.",
        )
    plan = generate_study_plan(topic, chunks)
    return plan