"""
Clause extraction agent.

Wraps the existing extract_clauses LLM call behind the BaseAgent interface.
"""

from typing import Any

from services.agents.base_agent import BaseAgent
from services.llm_client import extract_clauses


class ClauseAgent(BaseAgent):
    """Agent that extracts key legal clauses from contracts."""

    def __init__(self) -> None:
        super().__init__(
            name="Clause Agent",
            description="Extracts key legal clauses from contracts.",
        )

    def execute(self, text: str, **kwargs: Any) -> str:
        """Extract clauses from the contract text.

        Args:
            text: The full contract text.

        Returns:
            A Markdown table of extracted clauses.
        """
        self._validate_input(text)
        return extract_clauses(text)
