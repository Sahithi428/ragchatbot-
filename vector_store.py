import os
import json
import chromadb
from chromadb.config import Settings
from dotenv import load_dotenv

load_dotenv()

CHROMA_DB_DIR = os.getenv("CHROMA_DB_DIR", "./chroma_db")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")

# Initialize ChromaDB persistent client
_chroma_client = None
_collection = None
_sentence_transformer_model = None


def get_embedding_model():
    global _sentence_transformer_model
    if _sentence_transformer_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_transformer_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
        except Exception as e:
            print(f"[VectorStore] Warning: Could not load SentenceTransformer ({e}). Using simple embedding fallback.")
            _sentence_transformer_model = "fallback"
    return _sentence_transformer_model


def get_embedding(text: str):
    model = get_embedding_model()
    if model != "fallback" and hasattr(model, "encode"):
        vec = model.encode(text).tolist()
        return vec
    # Fallback simple deterministic vector for offline or lightweight environments
    words = text.lower().split()
    dim = 384
    vec = [0.0] * dim
    for idx, word in enumerate(words):
        pos = sum(ord(c) for c in word) % dim
        vec[pos] += 1.0 / (idx + 1)
    norm = sum(x*x for x in vec) ** 0.5
    if norm > 0:
        vec = [x/norm for x in vec]
    return vec


def get_chroma_collection():
    global _chroma_client, _collection
    if _collection is None:
        os.makedirs(CHROMA_DB_DIR, exist_ok=True)
        _chroma_client = chromadb.PersistentClient(path=CHROMA_DB_DIR)
        _collection = _chroma_client.get_or_create_collection(
            name="studentpath_opportunities",
            metadata={"hnsw:space": "cosine"}
        )
    return _collection


def index_opportunities(opportunities):
    collection = get_chroma_collection()
    
    ids = []
    documents = []
    metadatas = []
    embeddings = []

    for opp in opportunities:
        opp_id = str(opp.id)
        # Create rich text string for vector embedding
        majors_str = ", ".join(opp.majors) if isinstance(opp.majors, list) else str(opp.majors)
        tags_str = ", ".join(opp.tags) if isinstance(opp.tags, list) else str(opp.tags)
        
        doc_text = (
            f"Title: {opp.title}\n"
            f"Organization: {opp.org}\n"
            f"Type: {opp.type}\n"
            f"Description: {opp.description}\n"
            f"Majors: {majors_str}\n"
            f"Class Years: {', '.join(opp.class_years if isinstance(opp.class_years, list) else [])}\n"
            f"Stipend/Amount: {opp.amount_stipend}\n"
            f"Location Type: {opp.location_type} ({opp.location})\n"
            f"Tags: {tags_str}"
        )

        ids.append(opp_id)
        documents.append(doc_text)
        metadatas.append({
            "opp_id": opp.id,
            "title": opp.title,
            "org": opp.org,
            "type": opp.type,
            "deadline": opp.deadline,
            "min_gpa": float(opp.min_gpa),
            "location_type": opp.location_type,
            "application_url": opp.application_url
        })
        embeddings.append(get_embedding(doc_text))

    if ids:
        collection.upsert(
            ids=ids,
            documents=documents,
            metadatas=metadatas,
            embeddings=embeddings
        )
    print(f"[VectorStore] Indexed {len(ids)} opportunities into ChromaDB.")


def vector_search(query_text: str, candidate_ids: list = None, top_k: int = 10):
    """
    Perform semantic vector search within candidate_ids pool (if candidate_ids specified).
    Returns list of dicts with opp_id and similarity score.
    """
    collection = get_chroma_collection()
    query_emb = get_embedding(query_text)

    where_clause = None
    if candidate_ids is not None:
        if not candidate_ids:
            return []  # Empty candidate pool -> 0 results
        if len(candidate_ids) == 1:
            where_clause = {"opp_id": candidate_ids[0]}
        else:
            where_clause = {"opp_id": {"$in": candidate_ids}}

    try:
        results = collection.query(
            query_embeddings=[query_emb],
            n_results=min(top_k, max(1, len(candidate_ids) if candidate_ids else 50)),
            where=where_clause
        )
    except Exception as e:
        print(f"[VectorStore] Query warning: {e}. Performing manual score ordering.")
        return [{"opp_id": cid, "score": 1.0} for cid in (candidate_ids or [])[:top_k]]

    parsed = []
    if results and "ids" in results and results["ids"]:
        retrieved_ids = results["ids"][0]
        distances = results.get("distances", [[]])[0]
        for idx, item_id in enumerate(retrieved_ids):
            opp_id = int(item_id)
            # cosine distance to similarity score
            dist = distances[idx] if idx < len(distances) else 0.5
            score = max(0.0, 1.0 - float(dist))
            parsed.append({"opp_id": opp_id, "score": score})

    return parsed
