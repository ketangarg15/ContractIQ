"""
Clause extraction service.

Extracts key legal clauses from contracts using the Groq LLM client.
"""

from services.llm_client import generate_json_response
from models.prompts import clause_prompt
from schemas.contract_schemas import ClauseExtraction


def extract_clauses(contract_text: str) -> ClauseExtraction:
    """Extract key clauses from a contract using the LLM client.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        A ClauseExtraction Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot extract clauses from empty contract text.")

    prompt = clause_prompt(contract_text)
    return generate_json_response(prompt, ClauseExtraction)
