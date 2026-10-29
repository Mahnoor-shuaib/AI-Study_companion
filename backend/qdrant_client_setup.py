import os
import uuid
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from embeddings import get_embedding

load_dotenv()

client = QdrantClient(
    url=os.getenv("QDRANT_URL"),
    api_key=os.getenv("QDRANT_API_KEY")
)

COLLECTION_NAME = "study_notes"

def create_collection_if_not_exists():
    collections = client.get_collections().collections
    existing_names = [c.name for c in collections]

    if COLLECTION_NAME not in existing_names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=384, distance=Distance.COSINE)
        )

def store_chunks(chunks: list[str], embeddings: list[list[float]], source_file: str, doc_type: str = "notes"):
    points = [
        PointStruct(
            id=str(uuid.uuid4()),
            vector=embeddings[i],
            payload={
                "text": chunks[i],
                "source_file": source_file,
                "doc_type": doc_type,
                "chunk_id": i,
            },
        )
        for i in range(len(chunks))
    ]
    client.upsert(collection_name=COLLECTION_NAME, points=points)

def search_chunks(query: str, top_k: int = 5, min_score: float = 0.4):
    query_embedding = get_embedding(query)
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=top_k
    ).points
    return [r.payload["text"] for r in results if r.score >= min_score]

def search_chunks_with_scores(query: str, top_k: int = 5):
    query_embedding = get_embedding(query)
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_embedding,
        limit=top_k
    ).points
    return [
        {"score": round(r.score, 3), "text": r.payload["text"]}
        for r in results
    ]