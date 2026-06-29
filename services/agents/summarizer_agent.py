"""
Summarizer agent.

Wraps the existing summarize_contract LLM call behind the BaseAgent interface.
"""

from typing import Any

from services.agents.base_agent import BaseAgent
from services.llm_client import summarize_contract


class SummarizerAgent(BaseAgent):
    """Agent that generates structured contract summaries."""

    def __init__(self) -> None:
        super().__init__(
            name="Summarizer Agent",
            description="Generates structured contract summaries.",
        )

    def execute(self, text: str, **kwargs: Any) -> str:
        """Generate a structured summary of the contract.

        Args:
            text: The full contract text.

        Returns:
            A Markdown-formatted summary.
        """
        self._validate_input(text)
        return summarize_contract(text)
