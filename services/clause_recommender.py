"""
Clause recommendation service.

Suggests missing standard clauses that should be in a contract.
"""

from services.llm_client import generate_response
from models.prompts import recommendation_prompt


def recommend_clauses(contract_text: str) -> str:
    """Identify missing or weak clauses and recommend additions.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        A Markdown report of recommended missing clauses.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot recommend clauses for empty text.")

    prompt = recommendation_prompt(contract_text)
    return generate_response(prompt)
