"""
Contract type classification service.

Classifies contracts into categories (NDA, Service Agreement, etc.).
"""

from services.llm_client import generate_json_response
from models.prompts import classification_prompt
from schemas.contract_schemas import ContractClassification


def classify_contract(contract_text: str) -> ContractClassification:
    """Classify the contract type.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        A ContractClassification Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot classify empty text.")

    prompt = classification_prompt(contract_text)
    return generate_json_response(prompt, ContractClassification)
