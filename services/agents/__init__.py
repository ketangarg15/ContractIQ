"""
Multi-agent system for contract intelligence.

Each agent wraps a specific LLM capability (summarization, clause extraction,
risk analysis, compliance checking, negotiation suggestions, chat) behind a
consistent interface defined by BaseAgent.
"""

from services.agents.base_agent import BaseAgent
from services.agents.summarizer_agent import SummarizerAgent
from services.agents.clause_agent import ClauseAgent
from services.agents.risk_agent import RiskAgent
from services.agents.compliance_agent import ComplianceAgent
from services.agents.negotiation_agent import NegotiationAgent
from services.agents.chat_agent import ChatAgent

__all__ = [
    "BaseAgent",
    "SummarizerAgent",
    "ClauseAgent",
    "RiskAgent",
    "ComplianceAgent",
    "NegotiationAgent",
    "ChatAgent",
]
