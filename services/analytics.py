"""
Analytics service.

Aggregates data from the contract database for dashboard metrics and charts.
"""

from typing import Optional

from services.history import get_all_contracts, get_contract_count
from services.clause_library import get_all_clauses, get_clause_types, get_clause_count


def get_dashboard_stats(username: Optional[str] = None) -> dict:
    """Get high-level dashboard statistics, optionally filtered by user."""
    contracts = get_all_contracts(username)
    total = len(contracts)

    scores = [c["risk_score"] for c in contracts if c.get("risk_score") is not None]

    avg_score = sum(scores) / len(scores) if scores else 0
    low = sum(1 for s in scores if s <= 25)
    medium = sum(1 for s in scores if 26 <= s <= 50)
    high = sum(1 for s in scores if 51 <= s <= 75)
    critical = sum(1 for s in scores if s > 75)

    return {
        "total_contracts": total,
        "avg_risk_score": round(avg_score, 1),
        "low_risk_count": low,
        "medium_risk_count": medium,
        "high_risk_count": high,
        "critical_risk_count": critical,
        "total_clauses": get_clause_count(),
    }


def get_risk_distribution(username: Optional[str] = None) -> dict:
    """Get the distribution of risk scores across contracts."""
    contracts = get_all_contracts(username)
    scores = [c["risk_score"] for c in contracts if c.get("risk_score") is not None]

    low = sum(1 for s in scores if s <= 25)
    medium = sum(1 for s in scores if 26 <= s <= 50)
    high = sum(1 for s in scores if 51 <= s <= 75)
    critical = sum(1 for s in scores if s > 75)

    return {
        "labels": ["Low", "Medium", "High", "Critical"],
        "values": [low, medium, high, critical],
        "colors": ["#10B981", "#F59E0B", "#EF4444", "#7C3AED"],
    }


def get_risk_trend(username: Optional[str] = None) -> dict:
    """Get risk scores over time for trend analysis."""
    contracts = get_all_contracts(username)

    # Contracts are already sorted by upload_time desc, reverse for chronological
    contracts_sorted = list(reversed(contracts))

    dates = []
    scores = []
    filenames = []

    for c in contracts_sorted:
        if c.get("risk_score") is not None:
            dates.append(c.get("upload_time", ""))
            scores.append(c["risk_score"])
            filenames.append(c.get("filename", "Unknown"))

    return {
        "dates": dates,
        "scores": scores,
        "filenames": filenames,
    }


def get_clause_frequency() -> dict:
    """Get the frequency distribution of clause types in the library."""
    clauses = get_all_clauses()
    type_counts: dict[str, int] = {}

    for clause in clauses:
        ctype = clause.get("clause_type", "Unknown")
        type_counts[ctype] = type_counts.get(ctype, 0) + 1

    sorted_types = sorted(type_counts.items(), key=lambda x: x[1], reverse=True)

    return {
        "types": [t[0] for t in sorted_types],
        "counts": [t[1] for t in sorted_types],
    }


def get_contracts_summary_table(username: Optional[str] = None) -> list[dict]:
    """Get a summary table of all contracts for the dashboard."""
    from services.risk_analyzer import get_risk_level

    contracts = get_all_contracts(username)
    table = []

    for c in contracts:
        score = c.get("risk_score")
        level = get_risk_level(score) if score is not None else "N/A"

        table.append({
            "filename": c.get("filename", "Unknown"),
            "upload_time": c.get("upload_time", ""),
            "risk_score": score if score is not None else "N/A",
            "risk_level": level,
            "contract_type": c.get("contract_type", "Not classified"),
        })

    return table
