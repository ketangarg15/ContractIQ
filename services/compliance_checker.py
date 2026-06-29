"""
Compliance checking service.

Checks contracts against GDPR, HIPAA, and PCI DSS frameworks.
"""

from services.llm_client import generate_json_response
from models.prompts import compliance_prompt
from schemas.contract_schemas import ComplianceReport


def check_compliance(
    contract_text: str,
    frameworks: list[str] | None = None,
) -> ComplianceReport:
    """Check contract compliance against regulatory frameworks.

    Args:
        contract_text: The full extracted text of the contract.
        frameworks: List of frameworks to check. Defaults to all.

    Returns:
        A ComplianceReport Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot check compliance for empty text.")

    if frameworks is None:
        frameworks = ["GDPR", "HIPAA", "PCI DSS"]

    prompt = compliance_prompt(contract_text, frameworks)
    return generate_json_response(prompt, ComplianceReport)
