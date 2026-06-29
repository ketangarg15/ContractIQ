"""
Contract history service.

Manages persistence of analyzed contracts using SQLite + SQLAlchemy.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Optional

from sqlalchemy import (
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    create_engine,
)
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


DATABASE_DIR = Path("database")
DATABASE_PATH = DATABASE_DIR / "contracts.db"


class Base(DeclarativeBase):
    """SQLAlchemy declarative base."""
    pass


class UserRecord(Base):
    """SQLAlchemy model for user authentication."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(200), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    role = Column(String(100), default="Counsel", nullable=False)
    name = Column(String(200), nullable=False)
    initials = Column(String(20), nullable=False)
    email = Column(String(200), nullable=False)

    def to_dict(self) -> dict:
        return {
            "username": self.username,
            "role": self.role,
            "name": self.name,
            "initials": self.initials,
            "email": self.email,
        }


class ContractRecord(Base):
    """SQLAlchemy model for storing analyzed contract records."""

    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String(500), nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    summary = Column(Text, nullable=True)
    clauses = Column(Text, nullable=True)
    risk_analysis = Column(Text, nullable=True)
    risk_score = Column(Float, nullable=True)
    contract_type = Column(String(200), nullable=True)
    obligations = Column(Text, nullable=True)
    entities = Column(Text, nullable=True)
    red_flags = Column(Text, nullable=True)
    compliance = Column(Text, nullable=True)
    negotiation_suggestions = Column(Text, nullable=True)
    workflow_status = Column(String(100), default="Under Review", nullable=False)
    username = Column(String(200), default="sarah.mitchell", nullable=True)

    def __repr__(self) -> str:
        return f"<ContractRecord(id={self.id}, filename='{self.filename}')>"

    def to_dict(self) -> dict:
        from datetime import timedelta
        ist_time = self.upload_time + timedelta(hours=5, minutes=30) if self.upload_time else None
        return {
            "id": self.id,
            "filename": self.filename,
            "upload_time": ist_time.strftime("%Y-%m-%d %H:%M:%S")
            if ist_time
            else None,
            "summary": self.summary,
            "clauses": self.clauses,
            "risk_analysis": self.risk_analysis,
            "risk_score": self.risk_score,
            "contract_type": self.contract_type,
            "obligations": self.obligations,
            "entities": self.entities,
            "red_flags": self.red_flags,
            "compliance": self.compliance,
            "negotiation_suggestions": self.negotiation_suggestions,
            "workflow_status": self.workflow_status,
            "username": self.username,
        }



def _get_engine():
    """Create and return the SQLAlchemy engine.

    Returns:
        A SQLAlchemy engine connected to the SQLite database.
    """
    DATABASE_DIR.mkdir(exist_ok=True)
    engine = create_engine(
        f"sqlite:///{DATABASE_PATH}",
        echo=False,
        connect_args={"check_same_thread": False},
    )
    return engine


def _get_session() -> Session:
    """Create a new database session.

    Returns:
        A SQLAlchemy Session instance.
    """
    engine = _get_engine()
    SessionLocal = sessionmaker(bind=engine)
    return SessionLocal()


def init_database() -> None:
    """Initialize the database and create tables if they don't exist."""
    engine = _get_engine()
    Base.metadata.create_all(engine)
    
    # Seed default user if not present
    session = _get_session()
    try:
        demo_user = session.query(UserRecord).filter_by(username="sarah.mitchell").first()
        if not demo_user:
            demo = UserRecord(
                username="sarah.mitchell",
                password="password",
                role="Counsel",
                name="Sarah Mitchell",
                initials="SM",
                email="sarah.mitchell@contractiq.ai"
            )
            session.add(demo)
            session.commit()
    finally:
        session.close()


def create_user(
    username: str,
    password: str,
    role: str = "Counsel",
    name: str = "",
    initials: str = "",
    email: str = "",
) -> UserRecord:
    """Create a new user in the database."""
    session = _get_session()
    try:
        record = UserRecord(
            username=username,
            password=password, # In a real app we would hash this, but simple text is perfect for local developer prototyping.
            role=role,
            name=name,
            initials=initials,
            email=email,
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record
    finally:
        session.close()


def authenticate_user(username: str, password: str) -> Optional[UserRecord]:
    """Verify user login credentials against database records."""
    session = _get_session()
    try:
        record = session.query(UserRecord).filter_by(username=username, password=password).first()
        return record if record else None
    finally:
        session.close()


def save_contract(
    filename: str,
    summary: Optional[str] = None,
    clauses: Optional[str] = None,
    risk_analysis: Optional[str] = None,
    risk_score: Optional[float] = None,
    contract_type: Optional[str] = None,
    obligations: Optional[str] = None,
    entities: Optional[str] = None,
    red_flags: Optional[str] = None,
    compliance: Optional[str] = None,
    negotiation_suggestions: Optional[str] = None,
    username: Optional[str] = None,
) -> ContractRecord:
    """Save an analyzed contract to the database."""
    session = _get_session()
    try:
        record = ContractRecord(
            filename=filename,
            upload_time=datetime.utcnow(),
            summary=summary,
            clauses=clauses,
            risk_analysis=risk_analysis,
            risk_score=risk_score,
            contract_type=contract_type,
            obligations=obligations,
            entities=entities,
            red_flags=red_flags,
            compliance=compliance,
            negotiation_suggestions=negotiation_suggestions,
            username=username,
        )
        session.add(record)
        session.commit()
        session.refresh(record)
        return record
    finally:
        session.close()


def get_all_contracts(username: Optional[str] = None) -> list[dict]:
    """Retrieve all contract records from the database, filtered by username."""
    session = _get_session()
    try:
        query = session.query(ContractRecord)
        if username:
            query = query.filter_by(username=username)
        records = query.order_by(ContractRecord.upload_time.desc()).all()
        return [record.to_dict() for record in records]
    finally:
        session.close()


def get_contract_by_id(contract_id: int) -> Optional[dict]:
    """Retrieve a single contract record by ID."""
    session = _get_session()
    try:
        record = session.query(ContractRecord).filter_by(id=contract_id).first()
        return record.to_dict() if record else None
    finally:
        session.close()


def delete_contract(contract_id: int) -> bool:
    """Delete a contract record by ID."""
    session = _get_session()
    try:
        record = session.query(ContractRecord).filter_by(id=contract_id).first()
        if record:
            session.delete(record)
            session.commit()
            return True
        return False
    finally:
        session.close()


def get_contract_count(username: Optional[str] = None) -> int:
    """Get the total number of analyzed contracts, optionally filtered by username."""
    session = _get_session()
    try:
        query = session.query(ContractRecord)
        if username:
            query = query.filter_by(username=username)
        return query.count()
    finally:
        session.close()
