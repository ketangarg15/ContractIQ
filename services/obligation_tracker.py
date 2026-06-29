"""
Obligation tracker service.

Extracts deadlines, payment dates, renewal dates, and obligations from contracts.
"""

from services.llm_client import generate_json_response
from models.prompts import obligation_prompt
from schemas.contract_schemas import ObligationReport


def extract_obligations(contract_text: str) -> ObligationReport:
    """Extract contractual obligations and deadlines.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        An ObligationReport Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot extract obligations from empty text.")

    prompt = obligation_prompt(contract_text)
    return generate_json_response(prompt, ObligationReport)
