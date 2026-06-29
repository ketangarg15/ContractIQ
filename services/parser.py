"""
Document parser service.

Orchestrates file saving and text extraction from uploaded documents.
"""

from pathlib import Path
from typing import Optional

from utils.pdf_utils import save_uploaded_file, extract_text, get_file_size_mb


def parse_document(uploaded_file) -> tuple[str, Path]:
    """Parse an uploaded document and extract its text.

    Args:
        uploaded_file: A Streamlit UploadedFile object.

    Returns:
        A tuple of (extracted_text, file_path).

    Raises:
        ValueError: If the file is empty or unsupported.
        RuntimeError: If parsing fails.
    """
    file_path = save_uploaded_file(uploaded_file)
    file_size = get_file_size_mb(file_path)

    if file_size == 0:
        raise ValueError(
            f"The uploaded file '{uploaded_file.name}' is empty (0 bytes)."
        )

    text = extract_text(file_path)
    return text, file_path
