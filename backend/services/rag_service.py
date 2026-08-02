import os
import re
import chromadb
from chromadb.utils import embedding_functions
from backend.core.config import CHROMA_DB_PATH

# Ensure Chroma DB directory exists
os.makedirs(CHROMA_DB_PATH, exist_ok=True)

# ONNXMiniLM_L6_V2 is ChromaDB's built-in, lightweight ONNX embedding engine (zero PyTorch conflicts)
try:
    embedding_fn = embedding_functions.ONNXMiniLM_L6_V2()
except Exception:
    # Fallback to Chroma's default embedding function
    embedding_fn = embedding_functions.DefaultEmbeddingFunction()

def get_chroma_client():
    return chromadb.PersistentClient(path=CHROMA_DB_PATH)

def get_collection_name(document_id: str) -> str:
    # ChromaDB collection names must be 3-63 chars, alphanumeric or underscores
    clean_id = re.sub(r'[^a-zA-Z0-9_]', '_', document_id)
    return f"doc_{clean_id[:50]}"

def chunk_text(text: str, chunk_size_words: int = 300, overlap_words: int = 50) -> list[str]:
    """Chunk text by word count with specified overlap."""
    words = text.split()
    if not words:
        return []
    
    if len(words) <= chunk_size_words:
        return [" ".join(words)]
    
    chunks = []
    start = 0
    step = chunk_size_words - overlap_words
    
    while start < len(words):
        chunk_words = words[start:start + chunk_size_words]
        chunks.append(" ".join(chunk_words))
        start += step
        if start + overlap_words >= len(words) and start < len(words):
            chunks.append(" ".join(words[start:]))
            break
            
    return chunks

def index_document(document_id: str, text: str) -> int:
    """Index extracted document text into a dedicated ChromaDB collection for that document."""
    client = get_chroma_client()
    collection_name = get_collection_name(document_id)
    
    # Clean up existing collection if re-indexing
    try:
        client.delete_collection(name=collection_name)
    except Exception:
        pass

    collection = client.create_collection(
        name=collection_name,
        embedding_function=embedding_fn,
        metadata={"hnsw:space": "cosine"}
    )
    
    chunks = chunk_text(text)
    if not chunks:
        return 0

    ids = [f"{collection_name}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document_id, "chunk_index": i} for i in range(len(chunks))]

    collection.add(
        ids=ids,
        documents=chunks,
        metadatas=metadatas
    )

    return len(chunks)

def query_document(document_id: str, query: str, top_k: int = 3) -> list[dict]:
    """Query ChromaDB for relevant text chunks ONLY from the specified document_id collection."""
    client = get_chroma_client()
    collection_name = get_collection_name(document_id)
    
    try:
        collection = client.get_collection(
            name=collection_name,
            embedding_function=embedding_fn
        )
    except Exception:
        # Collection does not exist
        return []

    results = collection.query(
        query_texts=[query],
        n_results=top_k
    )

    retrieved = []
    if results and "documents" in results and results["documents"]:
        docs = results["documents"][0]
        metas = results["metadatas"][0] if "metadatas" in results else [{}] * len(docs)
        distances = results["distances"][0] if "distances" in results else [0.0] * len(docs)
        
        for d, m, dist in zip(docs, metas, distances):
            retrieved.append({
                "text": d,
                "metadata": m,
                "relevance_score": round(1.0 - float(dist), 4)
            })

    return retrieved

def delete_document_index(document_id: str) -> bool:
    """Delete ChromaDB collection associated with a document."""
    client = get_chroma_client()
    collection_name = get_collection_name(document_id)
    try:
        client.delete_collection(name=collection_name)
        return True
    except Exception:
        return False
