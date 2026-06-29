"""
Text chunking service.

Splits extracted document text into overlapping chunks
for embedding and vector search.
"""

from langchain_text_splitters import RecursiveCharacterTextSplitter


# Default chunking parameters
DEFAULT_CHUNK_SIZE = 1000
DEFAULT_CHUNK_OVERLAP = 200


def chunk_text(
    text: str,
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP,
) -> list[str]:
    """Split text into overlapping chunks using recursive character splitting.

    Args:
        text: The full document text to split.
        chunk_size: Maximum size of each chunk in characters.
        chunk_overlap: Number of overlapping characters between chunks.

    Returns:
        A list of text chunks.

    Raises:
        ValueError: If the text is empty or chunk parameters are invalid.
    """
    if not text or not text.strip():
        raise ValueError("Cannot chunk empty text.")

    if chunk_size <= 0:
        raise ValueError(f"chunk_size must be positive, got {chunk_size}")

    if chunk_overlap < 0 or chunk_overlap >= chunk_size:
        raise ValueError(
            f"chunk_overlap must be >= 0 and < chunk_size. "
            f"Got chunk_overlap={chunk_overlap}, chunk_size={chunk_size}"
        )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    chunks = splitter.split_text(text)

    if not chunks:
        raise ValueError("Text splitting produced no chunks.")

    return chunks
