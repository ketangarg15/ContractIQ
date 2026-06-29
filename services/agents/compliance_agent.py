"""
Compliance checking agent.

Checks contracts against GDPR, HIPAA, and PCI DSS regulatory frameworks.
"""

from typing import Any

from services.agents.base_agent import BaseAgent
from services.llm_client import generate_response
from models.prompts import compliance_prompt


class ComplianceAgent(BaseAgent):
    """Agent that checks contract compliance with regulatory frameworks."""

    def __init__(self) -> None:
        super().__init__(
            name="Compliance Agent",
            description="Checks GDPR, HIPAA, and PCI DSS compliance.",
        )

    def execute(self, text: str, **kwargs: Any) -> str:
        """Check contract compliance against regulatory frameworks.

        Args:
            text: The full contract text.
            **kwargs: Optional 'frameworks' list to check specific frameworks.

        Returns:
            A Markdown compliance report.
        """
        self._validate_input(text)
        frameworks = kwargs.get("frameworks", ["GDPR", "HIPAA", "PCI DSS"])
        prompt = compliance_prompt(text, frameworks)
        return generate_response(prompt)
