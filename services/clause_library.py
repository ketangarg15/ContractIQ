"""
Clause library service.

Stores and retrieves reusable legal clauses in SQLite (local)
or Postgres via DATABASE_URL env var (Supabase / production).
"""

import os
from datetime import datetime
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

# Reads the same DATABASE_URL used by history.py — both files share one DB.
DATABASE_URL = os.getenv("DATABASE_URL")

from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


DATABASE_DIR = Path("database")
DATABASE_PATH = DATABASE_DIR / "contracts.db"


class _ClauseBase(DeclarativeBase):
    """SQLAlchemy declarative base for clause library."""
    pass


class ClauseRecord(_ClauseBase):
    """SQLAlchemy model for the clause library table."""

    __tablename__ = "clause_library"

    id = Column(Integer, primary_key=True, autoincrement=True)
    clause_type = Column(String(200), nullable=False, index=True)
    clause_text = Column(Text, nullable=False)
    source_contract = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<ClauseRecord(id={self.id}, type='{self.clause_type}')>"

    def to_dict(self) -> dict:
        """Convert record to a dictionary."""
        return {
            "id": self.id,
            "clause_type": self.clause_type,
            "clause_text": self.clause_text,
            "source_contract": self.source_contract,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
            if self.created_at
            else None,
        }


def _get_engine():
    """Create and return the SQLAlchemy engine.

    Uses Postgres (Supabase) when DATABASE_URL env var is set.
    Raises ValueError if DATABASE_URL is not set to prevent SQLite fallback.
    """
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL environment variable is required but not set.")
    return create_engine(DATABASE_URL, pool_pre_ping=True)


def _get_session() -> Session:
    """Create a new database session."""
    engine = _get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def init_clause_library() -> None:
    """Initialize the clause library table if it doesn't exist."""
    engine = _get_engine()
    _ClauseBase.metadata.create_all(engine)


def save_clause(
    clause_type: str,
    clause_text: str,
    source_contract: Optional[str] = None,
) -> ClauseRecord:
    """Save a clause to the library.

    Args:
        clause_type: The type/category of the clause.
        clause_text: The full clause text.
        source_contract: The source contract filename (optional).

    Returns:
        The created ClauseRecord.
    """
    session = _get_session()
    try:
        record = ClauseRecord(
            clause_type=clause_type,
            clause_text=clause_text,
            source_contract=source_contract,
            created_at=datetime.utcnow(),
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record
    finally:
        session.close()


def get_clauses_by_type(clause_type: str) -> list[dict]:
    """Retrieve clauses by type.

    Args:
        clause_type: The clause type to filter by.

    Returns:
        A list of clause record dictionaries.
    """
    session = _get_session()
    try:
        records = (
            session.query(ClauseRecord)
            .filter(ClauseRecord.clause_type.ilike(f"%{clause_type}%"))
            .order_by(ClauseRecord.created_at.desc())
            .all()
        )
        return [r.to_dict() for r in records]
    finally:
        session.close()


def search_clauses(query: str) -> list[dict]:
    """Search clauses by text content.

    Args:
        query: The search query.

    Returns:
        A list of matching clause record dictionaries.
    """
    session = _get_session()
    try:
        records = (
            session.query(ClauseRecord)
            .filter(
                ClauseRecord.clause_text.ilike(f"%{query}%")
                | ClauseRecord.clause_type.ilike(f"%{query}%")
            )
            .order_by(ClauseRecord.created_at.desc())
            .limit(50)
            .all()
        )
        return [r.to_dict() for r in records]
    finally:
        session.close()


def get_all_clauses() -> list[dict]:
    """Retrieve all clauses from the library.

    Returns:
        A list of all clause record dictionaries.
    """
    session = _get_session()
    try:
        records = (
            session.query(ClauseRecord)
            .order_by(ClauseRecord.created_at.desc())
            .all()
        )
        return [r.to_dict() for r in records]
    finally:
        session.close()


def get_clause_types() -> list[str]:
    """Get all unique clause types in the library.

    Returns:
        A sorted list of unique clause type strings.
    """
    session = _get_session()
    try:
        types = (
            session.query(ClauseRecord.clause_type)
            .distinct()
            .all()
        )
        return sorted([t[0] for t in types])
    finally:
        session.close()


def delete_clause(clause_id: int) -> bool:
    """Delete a clause from the library.

    Args:
        clause_id: The ID of the clause to delete.

    Returns:
        True if deleted, False if not found.
    """
    session = _get_session()
    try:
        record = session.query(ClauseRecord).filter_by(id=clause_id).first()
        if record:
            session.delete(record)
            session.commit()
            return True
        return False
    finally:
        session.close()


def get_clause_count() -> int:
    """Get the total number of clauses in the library.

    Returns:
        The count of clause records.
    """
    session = _get_session()
    try:
        return session.query(ClauseRecord).count()
    finally:
        session.close()
