"""
FAISS vector store service.

Manages creation, persistence, and querying of the FAISS index
along with the associated text chunks.
"""

import pickle
from pathlib import Path
from typing import Optional

import faiss
import numpy as np

from services.embeddings import generate_embeddings, generate_single_embedding


VECTOR_STORE_DIR = Path("vector_store")


def get_paths(contract_id: str | int) -> tuple[Path, Path]:
    """Get the file paths for a specific contract's vector store.

    Args:
        contract_id: The ID of the contract.

    Returns:
        A tuple of (faiss_index_path, chunks_pickle_path).
    """
    dir_path = VECTOR_STORE_DIR / str(contract_id)
    dir_path.mkdir(parents=True, exist_ok=True)
    return dir_path / "faiss.index", dir_path / "chunks.pkl"


def build_vector_store(chunks: list[str], contract_id: str | int) -> tuple[faiss.Index, list[str]]:
    """Build a FAISS index from text chunks and persist to disk.

    Args:
        chunks: A list of text chunks to index.
        contract_id: The ID of the contract to scope files.

    Returns:
        A tuple of (FAISS index, chunks list).

    Raises:
        ValueError: If chunks list is empty.
    """
    if not chunks:
        raise ValueError("Cannot build vector store from empty chunks list.")

    embeddings = generate_embeddings(chunks)
    dimension = embeddings.shape[1]

    # Use Inner Product index (works with normalized embeddings = cosine similarity)
    index = faiss.IndexFlatIP(dimension)
    index.add(embeddings.astype(np.float32))

    # Persist to disk
    _save_vector_store(index, chunks, contract_id)

    return index, chunks


def _save_vector_store(index: faiss.Index, chunks: list[str], contract_id: str | int) -> None:
    """Save FAISS index and chunks to disk.

    Args:
        index: The FAISS index to save.
        chunks: The associated text chunks.
        contract_id: The ID of the contract.
    """
    index_path, chunks_path = get_paths(contract_id)
    faiss.write_index(index, str(index_path))
    with open(chunks_path, "wb") as f:
        pickle.dump(chunks, f)


def load_vector_store(contract_id: str | int) -> Optional[tuple[faiss.Index, list[str]]]:
    """Load existing FAISS index and chunks from disk.

    If the index files are not found (e.g. ephemeral Render disk was wiped on
    restart/redeploy), automatically attempts to rebuild the index from the
    contract's saved raw text at ``contract_texts/{contract_id}.txt``.

    Args:
        contract_id: The ID of the contract.

    Returns:
        A tuple of (FAISS index, chunks list).

    Raises:
        FileNotFoundError: If both the vector store AND the raw contract text
            are missing — the contract needs to be re-uploaded.
    """
    index_path, chunks_path = get_paths(contract_id)

    # Fast path: index already on disk
    if index_path.exists() and chunks_path.exists():
        try:
            index = faiss.read_index(str(index_path))
            with open(chunks_path, "rb") as f:
                chunks = pickle.load(f)
            return index, chunks
        except Exception:
            pass  # Corrupted files — fall through to rebuild

    # Rebuild path: vector store missing, retrieve raw text using get_contract_text
    try:
        from services.storage_client import get_contract_text
        text = get_contract_text(contract_id)
        from services.chunker import chunk_text
        chunks = chunk_text(text)
        index, chunks = build_vector_store(chunks, contract_id)
        return index, chunks
    except FileNotFoundError:
        # Both missing — contract must be re-uploaded
        raise FileNotFoundError(
            f"Vector store and contract text for contract {contract_id} are both "
            f"missing. Please re-upload the contract to regenerate the index."
        )
    except Exception as e:
        raise RuntimeError(
            f"Failed to rebuild vector store for contract {contract_id} "
            f"from saved text: {e}"
        )


def search_similar_chunks(
    query: str,
    index: faiss.Index,
    chunks: list[str],
    top_k: int = 3,
) -> list[dict[str, any]]:
    """Search the FAISS index for chunks similar to the query.

    Args:
        query: The search query string.
        index: The FAISS index to search.
        chunks: The list of text chunks corresponding to index entries.
        top_k: Number of top results to return.

    Returns:
        A list of dicts with keys 'text', 'score', and 'index'.
    """
    if not query or not query.strip():
        return []

    query_embedding = generate_single_embedding(query)
    query_vector = query_embedding.reshape(1, -1).astype(np.float32)

    scores, indices = index.search(query_vector, min(top_k, index.ntotal))

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx >= 0 and idx < len(chunks):
            results.append({
                "text": chunks[idx],
                "score": float(score),
                "index": int(idx),
            })

    return results


def vector_store_exists(contract_id: str | int) -> bool:
    """Check if a persisted vector store exists on disk.

    Args:
        contract_id: The ID of the contract.

    Returns:
        True if both index and chunks files exist.
    """
    index_path, chunks_path = get_paths(contract_id)
    return index_path.exists() and chunks_path.exists()


def clear_vector_store(contract_id: str | int) -> None:
    """Delete the persisted vector store files.

    Args:
        contract_id: The ID of the contract.
    """
    index_path, chunks_path = get_paths(contract_id)
    if index_path.exists():
        index_path.unlink()
    if chunks_path.exists():
        chunks_path.unlink()
