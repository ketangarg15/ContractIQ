"""
Negotiation suggestions service.

Suggests improved contract clause wording and negotiation strategies.
"""

from services.llm_client import generate_json_response
from models.prompts import negotiation_prompt
from schemas.contract_schemas import NegotiationReport


def suggest_negotiations(contract_text: str, red_flags_context: str | None = None) -> NegotiationReport:
    """Generate negotiation suggestions for the contract.

    Args:
        contract_text: The full extracted text of the contract.
        red_flags_context: Optional JSON string of previously detected red flags,
            used to prioritize negotiation suggestions for flagged issues.

    Returns:
        A NegotiationReport Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot generate negotiations for empty text.")

    prompt = negotiation_prompt(contract_text, red_flags_context=red_flags_context)
    return generate_json_response(prompt, NegotiationReport)
