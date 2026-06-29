"""
Risk analysis agent.

Wraps the existing analyze_risks LLM call behind the BaseAgent interface.
"""

from typing import Any

from services.agents.base_agent import BaseAgent
from services.llm_client import analyze_risks


class RiskAgent(BaseAgent):
    """Agent that analyzes contract risks and generates risk scores."""

    def __init__(self) -> None:
        super().__init__(
            name="Risk Agent",
            description="Analyzes contract risks and generates risk scores.",
        )

    def execute(self, text: str, **kwargs: Any) -> tuple[str, int]:
        """Analyze risks in the contract text.

        Args:
            text: The full contract text.

        Returns:
            A tuple of (risk_analysis_markdown, risk_score_int).
        """
        self._validate_input(text)
        return analyze_risks(text)
