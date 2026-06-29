"""
Chatbot service (RAG - Retrieval Augmented Generation).

Implements the conversational interface over contracts using
FAISS retrieval + Groq generation.
"""

from services.vector_store import search_similar_chunks
from services.llm_client import generate_response
from models.prompts import citation_chat_prompt


def chat_with_contract(
    question: str,
    index,
    chunks: list[str],
    top_k: int = 6,
) -> tuple[str, list[dict]]:
    """Answer a question about a contract using RAG.

    Workflow:
        1. Search FAISS for top-k relevant chunks
        2. Build context from retrieved chunks
        3. Send context + question to Groq
        4. Return answer and source chunks

    Args:
        question: The user's question.
        index: The FAISS index.
        chunks: The text chunks associated with the index.
        top_k: Number of chunks to retrieve.

    Returns:
        A tuple of (answer_text, source_chunks).
    """
    # Retrieve relevant chunks
    results = search_similar_chunks(question, index, chunks, top_k=top_k)

    if not results:
        return (
            "I could not find relevant sections in the contract to answer your question.",
            [],
        )

    # Build context from retrieved chunks
    context_parts = []
    for i, result in enumerate(results, 1):
        context_parts.append(f"**Section {i}** (relevance: {result['score']:.3f}):\n{result['text']}")

    context = "\n\n---\n\n".join(context_parts)

    # Generate answer using Groq integration
    prompt = citation_chat_prompt(context, question)
    answer = generate_response(prompt)

    return answer, results
