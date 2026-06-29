"""
Named entity recognition service.

Extracts parties, dates, amounts, jurisdictions, and other entities from contracts.
"""

from services.llm_client import generate_json_response
from models.prompts import ner_prompt
from schemas.contract_schemas import EntityReport


def extract_entities(contract_text: str) -> EntityReport:
    """Extract named entities from the contract text.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        An EntityReport Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot extract entities from empty text.")

    prompt = ner_prompt(contract_text)
    return generate_json_response(prompt, EntityReport)
