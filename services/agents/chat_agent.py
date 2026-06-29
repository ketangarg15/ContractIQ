"""
Chat agent with citation-based responses.

Wraps RAG chatbot with source chunk citation support.
"""

from typing import Any

from services.agents.base_agent import BaseAgent
from services.llm_client import generate_response
from services.vector_store import search_similar_chunks
from models.prompts import citation_chat_prompt


class ChatAgent(BaseAgent):
    """Agent that answers questions with citation-based responses."""

    def __init__(self) -> None:
        super().__init__(
            name="Chat Agent",
            description="RAG-powered chat with citation-based responses.",
        )

    def execute(self, text: str, **kwargs: Any) -> tuple[str, list[dict]]:
        """Answer a question about a contract with citations.

        Args:
            text: The user's question.
            **kwargs:
                index: The FAISS index.
                chunks: The text chunks.
                top_k: Number of chunks to retrieve (default 5).

        Returns:
            A tuple of (cited_answer, source_chunks).
        """
        index = kwargs.get("index")
        chunks = kwargs.get("chunks")
        top_k = kwargs.get("top_k", 5)

        if index is None or chunks is None:
            return (
                "Chat requires a vector index. Please upload a contract first.",
                [],
            )

        results = search_similar_chunks(text, index, chunks, top_k=top_k)

        if not results:
            return (
                "I could not find relevant sections to answer your question.",
                [],
            )

        # Build context with numbered chunk references for citations
        context_parts = []
        for i, result in enumerate(results, 1):
            context_parts.append(
                f"[Source {i}] (relevance: {result['score']:.3f}):\n{result['text']}"
            )

        context = "\n\n---\n\n".join(context_parts)

        prompt = citation_chat_prompt(context, text)
        answer = generate_response(prompt)

        return answer, results
