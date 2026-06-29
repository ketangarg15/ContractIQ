"""
Contract summarization service.

Generates structured summaries of contracts by calling the Groq LLM client.
"""

from services.llm_client import generate_json_response
from models.prompts import summary_prompt
from schemas.contract_schemas import ContractSummary


def summarize_contract(contract_text: str) -> ContractSummary:
    """Generate a structured summary of a contract using the LLM client.

    Args:
        contract_text: The full extracted text of the contract.

    Returns:
        A ContractSummary Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot summarize empty contract text.")

    prompt = summary_prompt(contract_text)
    return generate_json_response(prompt, ContractSummary)
