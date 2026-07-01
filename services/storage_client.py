"""
Supabase Storage client.

Used to persist extracted contract text so it survives ephemeral-disk
restarts on hosts like Render's free tier. The local filesystem is treated
as a fast cache only; Supabase Storage is the durable source of truth.
"""

import os
from pathlib import Path
from typing import Optional
from supabase import create_client, Client

_client: Client | None = None

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "contract-texts")
RAW_CONTRACTS_BUCKET = "contracts"


def get_storage_client() -> Client | None:
    """Return a cached Supabase client, or None if Supabase env vars aren't set.

    Returning None (rather than raising) lets local development continue to
    work with local-disk-only storage when Supabase isn't configured —
    callers should fall back to local disk behavior in that case.
    """
    global _client
    if _client is not None:
        return _client

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        return None

    _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    # Auto-create the buckets if they don't exist
    try:
        buckets = [b.name for b in _client.storage.list_buckets()]
        if SUPABASE_STORAGE_BUCKET not in buckets:
            _client.storage.create_bucket(SUPABASE_STORAGE_BUCKET, options={"public": True})
        if RAW_CONTRACTS_BUCKET not in buckets:
            _client.storage.create_bucket(RAW_CONTRACTS_BUCKET, options={"public": False})
    except Exception as e:
        print(f"Failed to initialize buckets: {e}")

    return _client


def upload_contract(contract_id: str, file_data: bytes, filename: str) -> str:
    """Upload a raw contract document (PDF/DOCX) to the 'contracts' bucket.

    Args:
        contract_id: Unique contract ID.
        file_data: Raw binary content of the file.
        filename: Name of the file.

    Returns:
        The storage path within the bucket (e.g. 'contract_id/filename').
    """
    client = get_storage_client()
    if client is None:
        raise RuntimeError("Supabase client is not configured.")

    # Sanitize/format the path
    # e.g., "12/contract.pdf"
    path = f"{contract_id}/{filename}"
    
    # Detach any potential extension or MIME issues, let Supabase deduce or keep simple application/octet-stream
    ext = Path(filename).suffix.lower()
    content_type = "application/pdf" if ext == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    
    client.storage.from_(RAW_CONTRACTS_BUCKET).upload(
        path,
        file_data,
        file_options={"content-type": content_type, "upsert": "true"},
    )
    # Log successful upload
    print(f"[Supabase Storage] Upload complete: {path} uploaded to bucket '{RAW_CONTRACTS_BUCKET}'")
    return path


def download_contract(storage_path: str) -> bytes:
    """Download raw contract document content from the 'contracts' bucket.

    Args:
        storage_path: The file path in the bucket (e.g. 'contract_id/filename').

    Returns:
        The raw bytes of the file.
    """
    client = get_storage_client()
    if client is None:
        raise RuntimeError("Supabase client is not configured.")

    print(f"[Supabase Storage] Downloading contract file: {storage_path}")
    return client.storage.from_(RAW_CONTRACTS_BUCKET).download(storage_path)


def delete_contract(storage_path: str) -> bool:
    """Delete a contract document from the 'contracts' bucket.

    Args:
        storage_path: The file path in the bucket (e.g. 'contract_id/filename').

    Returns:
        True if deleted successfully, False otherwise.
    """
    client = get_storage_client()
    if client is None:
        return False

    try:
        client.storage.from_(RAW_CONTRACTS_BUCKET).remove([storage_path])
        print(f"[Supabase Storage] Deleted file: {storage_path} from bucket '{RAW_CONTRACTS_BUCKET}'")
        return True
    except Exception as e:
        print(f"Failed to delete file {storage_path} from Supabase: {e}")
        return False


def generate_signed_url(storage_path: str) -> str:
    """Generate a signed download URL for a contract file (valid for 1 hour).

    Args:
        storage_path: The file path in the bucket (e.g. 'contract_id/filename').

    Returns:
        The temporary signed URL string.
    """
    client = get_storage_client()
    if client is None:
        raise RuntimeError("Supabase client is not configured.")

    res = client.storage.from_(RAW_CONTRACTS_BUCKET).create_signed_url(storage_path, 3600)
    return res.get("signedURL") or res.get("signedUrl") or ""


def upload_contract_text(contract_id: str, text: str) -> bool:
    """Upload extracted contract text to Supabase Storage.

    Args:
        contract_id: Unique contract identifier, used as the storage path.
        text: The extracted plain text to persist.

    Returns:
        True if uploaded successfully, False if Supabase isn't configured
        (caller should rely on local disk only in that case) or the upload
        failed.
    """
    client = get_storage_client()
    if client is None:
        return False

    path = f"{contract_id}.txt"
    try:
        client.storage.from_(SUPABASE_STORAGE_BUCKET).upload(
            path,
            text.encode("utf-8"),
            file_options={"content-type": "text/plain", "upsert": "true"},
        )
        print(f"[Supabase Storage] Extracted text upload complete: {path}")
        return True
    except Exception as e:
        # Log but don't crash the upload pipeline over a storage backup failure —
        # the local disk copy still exists for the current process lifetime.
        print(f"Supabase Storage upload failed for contract {contract_id}: {e}")
        return False


def download_contract_text(contract_id: str) -> Optional[str]:
    """Download extracted contract text from Supabase Storage.

    Args:
        contract_id: Unique contract identifier, used as the storage path.

    Returns:
        The text content if found, None if Supabase isn't configured, the
        file doesn't exist, or the download failed.
    """
    client = get_storage_client()
    if client is None:
        return None

    path = f"{contract_id}.txt"
    try:
        result = client.storage.from_(SUPABASE_STORAGE_BUCKET).download(path)
        return result.decode("utf-8")
    except Exception:
        return None


def get_contract_text(contract_id: str | int) -> str:
    """Retrieve contract text from local disk cache, falling back to Supabase Storage if missing.

    If downloaded from Supabase Storage, saves it back to local disk cache.

    Args:
        contract_id: Unique contract ID.

    Returns:
        The contract text content.

    Raises:
        FileNotFoundError: If the text is missing both locally and in Supabase Storage.
    """
    text_path = Path("contract_texts") / f"{contract_id}.txt"

    # 1. Try local disk cache
    if text_path.exists():
        try:
            with open(text_path, "r", encoding="utf-8") as f:
                content = f.read()
                if content:
                    return content
        except Exception:
            pass

    # 2. Try Supabase Storage fallback
    downloaded = download_contract_text(str(contract_id))
    if downloaded:
        # Save back to local cache
        try:
            text_path.parent.mkdir(exist_ok=True)
            with open(text_path, "w", encoding="utf-8") as f:
                f.write(downloaded)
        except Exception as e:
            print(f"Failed to cache downloaded contract text locally for {contract_id}: {e}")
        return downloaded

    raise FileNotFoundError(
        f"Contract text for contract {contract_id} is unavailable. "
        "Please re-upload this contract."
    )
