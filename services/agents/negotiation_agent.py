"""
Negotiation suggestions agent.

Suggests improved clause wording and negotiation strategies.
"""

from typing import Any

from services.agents.base_agent import BaseAgent
from services.llm_client import generate_response
from models.prompts import negotiation_prompt


class NegotiationAgent(BaseAgent):
    """Agent that suggests improved contract clause wording."""

    def __init__(self) -> None:
        super().__init__(
            name="Negotiation Agent",
            description="Suggests improved clause wording and negotiation strategies.",
        )

    def execute(self, text: str, **kwargs: Any) -> str:
        """Generate negotiation suggestions for the contract.

        Args:
            text: The full contract text.

        Returns:
            A Markdown report with original vs. suggested wording.
        """
        self._validate_input(text)
        prompt = negotiation_prompt(text)
        return generate_response(prompt)
