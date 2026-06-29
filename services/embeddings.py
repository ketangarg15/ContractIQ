"""
Embedding service.

Generates vector embeddings using the SentenceTransformer model.
Uses Streamlit caching to avoid expensive model reloads.
"""

import numpy as np
import streamlit as st
from sentence_transformers import SentenceTransformer


MODEL_NAME = "all-MiniLM-L6-v2"


@st.cache_resource(show_spinner="Loading embedding model...")
def get_embedding_model() -> SentenceTransformer:
    """Load and cache the SentenceTransformer model.

    Returns:
        A cached SentenceTransformer model instance.
    """
    return SentenceTransformer(MODEL_NAME)


def generate_embeddings(texts: list[str]) -> np.ndarray:
    """Generate embeddings for a list of text strings.

    Args:
        texts: A list of text strings to embed.

    Returns:
        A numpy array of shape (len(texts), embedding_dim).

    Raises:
        ValueError: If the texts list is empty.
    """
    if not texts:
        raise ValueError("Cannot generate embeddings for empty text list.")

    model = get_embedding_model()
    embeddings = model.encode(
        texts,
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return embeddings


def generate_single_embedding(text: str) -> np.ndarray:
    """Generate an embedding for a single text string.

    Args:
        text: A single text string to embed.

    Returns:
        A 1D numpy array of the embedding vector.

    Raises:
        ValueError: If the text is empty.
    """
    if not text or not text.strip():
        raise ValueError("Cannot generate embedding for empty text.")

    model = get_embedding_model()
    embedding = model.encode(
        [text],
        show_progress_bar=False,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    return embedding[0]
