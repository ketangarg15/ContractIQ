"""
Base agent class for the multi-agent contract intelligence system.

All specialized agents inherit from BaseAgent, which provides:
- Consistent interface via execute() abstract method
- Built-in error handling
- Agent metadata (name, description)
"""

from abc import ABC, abstractmethod
from typing import Any


class BaseAgent(ABC):
    """Abstract base class for all contract intelligence agents.

    Subclasses must implement the `execute` method to perform their
    specific analysis task.
    """

    def __init__(self, name: str, description: str) -> None:
        """Initialize the agent.

        Args:
            name: Human-readable agent name.
            description: Short description of the agent's role.
        """
        self._name = name
        self._description = description

    @property
    def name(self) -> str:
        """The human-readable name of the agent."""
        return self._name

    @property
    def description(self) -> str:
        """A short description of the agent's purpose."""
        return self._description

    @abstractmethod
    def execute(self, text: str, **kwargs: Any) -> str | tuple:
        """Execute the agent's task on the given text.

        Args:
            text: The contract text to analyze.
            **kwargs: Additional keyword arguments specific to the agent.

        Returns:
            A string (or tuple) with the analysis results.

        Raises:
            RuntimeError: If the underlying LLM call fails.
            ValueError: If the input text is empty.
        """
        ...

    def _validate_input(self, text: str) -> None:
        """Validate that input text is non-empty.

        Args:
            text: The input text to validate.

        Raises:
            ValueError: If text is empty or whitespace-only.
        """
        if not text or not text.strip():
            raise ValueError(
                f"{self._name}: Cannot process empty contract text."
            )

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__}(name='{self._name}')>"
