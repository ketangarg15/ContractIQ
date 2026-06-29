"""
Contract comparison service.

Compares two contracts and highlights differences using LLM analysis.
"""

from services.llm_client import generate_json_response
from models.prompts import comparison_prompt
from schemas.contract_schemas import ComparisonReport


def compare_contracts(text_a: str, text_b: str) -> ComparisonReport:
    """Compare two contract texts and identify differences.

    Args:
        text_a: Text of the first contract (original / template).
        text_b: Text of the second contract (comparison).

    Returns:
        A ComparisonReport Pydantic model.

    Raises:
        ValueError: If either text is empty.
    """
    if not text_a or not text_a.strip():
        raise ValueError("Contract A text is empty.")
    if not text_b or not text_b.strip():
        raise ValueError("Contract B text is empty.")

    prompt = comparison_prompt(text_a, text_b)
    return generate_json_response(prompt, ComparisonReport)
