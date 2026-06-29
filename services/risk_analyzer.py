"""
Risk analysis service.

Analyzes contracts for potential risks and generates risk scores using the LLM client.
"""

from services.llm_client import generate_json_response
from models.prompts import risk_prompt
from schemas.contract_schemas import RiskAnalysis


def analyze_risks(contract_text: str, red_flags_context: str | None = None) -> RiskAnalysis:
    """Analyze a contract for risks and generate a risk score using the LLM client.

    Args:
        contract_text: The full extracted text of the contract.
        red_flags_context: Optional JSON string of previously detected red flags,
            used to ensure risk assessment consistency with red flag findings.

    Returns:
        A RiskAnalysis Pydantic model.

    Raises:
        ValueError: If the contract text is empty.
    """
    if not contract_text or not contract_text.strip():
        raise ValueError("Cannot analyze risks for empty contract text.")

    prompt = risk_prompt(contract_text, red_flags_context=red_flags_context)
    return generate_json_response(prompt, RiskAnalysis)


def get_risk_level(score: int) -> str:
    """Convert a numerical risk score to a risk level label.

    Args:
        score: An integer risk score (0-100).

    Returns:
        A risk level string.
    """
    if score <= 25:
        return "Low"
    elif score <= 50:
        return "Medium"
    elif score <= 75:
        return "High"
    else:
        return "Critical"


def get_risk_color(score: int) -> str:
    """Get the display color for a risk score.

    Args:
        score: An integer risk score (0-100).

    Returns:
        A hex color string.
    """
    if score <= 25:
        return "#3D6B4F"  # --ok
    elif score <= 50:
        return "#B8862E"  # --warn
    elif score <= 75:
        return "#A23B3B"  # --danger
    else:
        return "#9C7A3C"  # --accent
