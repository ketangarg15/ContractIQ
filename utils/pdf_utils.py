"""
PDF and document utility functions.

Handles file saving and text extraction from PDF and DOCX files.
"""

import os
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF


UPLOAD_DIR = Path("uploads")


def save_uploaded_file(uploaded_file) -> Path:
    """Save a Streamlit UploadedFile to the uploads directory.

    Args:
        uploaded_file: A Streamlit UploadedFile object.

    Returns:
        The Path where the file was saved.

    Raises:
        OSError: If the file cannot be written to disk.
    """
    UPLOAD_DIR.mkdir(exist_ok=True)
    file_path = UPLOAD_DIR / uploaded_file.name
    with open(file_path, "wb") as f:
        f.write(uploaded_file.getbuffer())
    return file_path


def extract_text_from_pdf(file_path: Path) -> str:
    """Extract text from a PDF file using PyMuPDF.

    Args:
        file_path: Path to the PDF file.

    Returns:
        Extracted plain text from all pages.

    Raises:
        ValueError: If the PDF is empty or contains no extractable text.
        FileNotFoundError: If the file does not exist.
        RuntimeError: If the PDF is corrupt or cannot be opened.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"PDF file not found: {file_path}")

    try:
        doc = fitz.open(str(file_path))
    except Exception as e:
        raise RuntimeError(f"Failed to open PDF file '{file_path.name}': {e}")

    text_parts: list[str] = []
    for page_num, page in enumerate(doc):
        page_text = page.get_text("text")
        if page_text.strip():
            text_parts.append(page_text)

    doc.close()

    full_text = "\n\n".join(text_parts)

    if not full_text.strip():
        raise ValueError(
            f"The PDF '{file_path.name}' contains no extractable text. "
            "It may be a scanned document or image-based PDF."
        )

    return full_text


def extract_text_from_docx(file_path: Path) -> str:
    """Extract text from a DOCX file using python-docx.

    Args:
        file_path: Path to the DOCX file.

    Returns:
        Extracted plain text from all paragraphs.

    Raises:
        ValueError: If the DOCX is empty.
        FileNotFoundError: If the file does not exist.
        RuntimeError: If the DOCX is corrupt or cannot be opened.
    """
    if not file_path.exists():
        raise FileNotFoundError(f"DOCX file not found: {file_path}")

    try:
        from docx import Document
        doc = Document(str(file_path))
    except Exception as e:
        raise RuntimeError(f"Failed to open DOCX file '{file_path.name}': {e}")

    text_parts: list[str] = []
    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)

    full_text = "\n\n".join(text_parts)

    if not full_text.strip():
        raise ValueError(
            f"The DOCX '{file_path.name}' contains no extractable text."
        )

    return full_text


def extract_text(file_path: Path) -> str:
    """Extract text from a supported document file.

    Dispatches to the appropriate extractor based on file extension.

    Args:
        file_path: Path to the document file (PDF or DOCX).

    Returns:
        Extracted plain text.

    Raises:
        ValueError: If the file type is not supported.
    """
    extension = file_path.suffix.lower()

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)
    elif extension in (".docx", ".doc"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(
            f"Unsupported file format: '{extension}'. "
            "Please upload a PDF or DOCX file."
        )


def get_file_size_mb(file_path: Path) -> float:
    """Get file size in megabytes.

    Args:
        file_path: Path to the file.

    Returns:
        File size in MB, rounded to 2 decimal places.
    """
    size_bytes = os.path.getsize(file_path)
    return round(size_bytes / (1024 * 1024), 2)
