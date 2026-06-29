"""
Red flag detection service.

Detects dangerous or problematic contract provisions.
"""

from services.llm_client import generate_json_response
from models.prompts import red_flag_prompt
from schemas.contract_schemas import RedFlagReport


def detect_red_flags(contract_text: str) -> RedFlagReport:
    """Detect red flags in the contract text.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        A RedFlagReport Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot detect red flags in empty text.")

    prompt = red_flag_prompt(contract_text)
    return generate_json_response(prompt, RedFlagReport)
