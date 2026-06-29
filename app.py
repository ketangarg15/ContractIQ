"""
Contract Intelligence Platform — Streamlit Application.

AI-powered contract analysis tool featuring:
- Contract upload (PDF/DOCX) with multi-contract support
- Structured summarization & contract type classification
- Clause extraction & clause library
- Risk analysis with gauge scoring & risk heatmap
- RAG-powered chatbot with citations
- Contract comparison
- Obligation tracking & timeline visualization
- Named entity recognition
- Red flag detection
- Compliance checking (GDPR/HIPAA/PCI DSS)
- AI negotiation suggestions
- Clause recommendations
- Executive dashboard & analytics
- PDF export
- Semantic search
- Analysis history
"""

import os
import re
import sys
from pathlib import Path

import plotly.graph_objects as go
import plotly.express as px
import streamlit as st
from dotenv import load_dotenv

# ── Load environment variables ──────────────────────────────────────────
load_dotenv()

# ── Page configuration ──────────────────────────────────────────────────
st.set_page_config(
    page_title="Contract Intelligence Platform",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Custom CSS ──────────────────────────────────────────────────────────
st.markdown("""
<style>
    /* ── Global Theme ──────────────────────────────────────────────── */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

    .stApp {
        font-family: 'Inter', sans-serif;
    }

    /* ── Header ────────────────────────────────────────────────────── */
    .main-header {
        background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #1a4971 100%);
        padding: 2rem 2.5rem;
        border-radius: 16px;
        margin-bottom: 1.5rem;
        box-shadow: 0 8px 32px rgba(30, 58, 95, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .main-header h1 {
        color: #ffffff;
        font-size: 2rem;
        font-weight: 700;
        margin: 0 0 0.3rem 0;
        letter-spacing: -0.5px;
    }

    .main-header p {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1rem;
        margin: 0;
        font-weight: 300;
    }

    /* ── Metric Cards ──────────────────────────────────────────────── */
    .metric-card {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .metric-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }

    .metric-value {
        font-size: 1.8rem;
        font-weight: 700;
        color: #1e3a5f;
        margin: 0;
    }

    .metric-label {
        font-size: 0.85rem;
        color: #64748b;
        margin: 0.25rem 0 0 0;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* ── Status Badges ─────────────────────────────────────────────── */
    .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: 600;
    }

    .status-low { background: #d1fae5; color: #065f46; }
    .status-medium { background: #fef3c7; color: #92400e; }
    .status-high { background: #fee2e2; color: #991b1b; }
    .status-critical { background: #ede9fe; color: #5b21b6; }

    /* ── Chat Messages ─────────────────────────────────────────────── */
    .chat-user {
        background: linear-gradient(135deg, #1e3a5f, #2d5a87);
        color: white;
        padding: 1rem 1.25rem;
        border-radius: 16px 16px 4px 16px;
        margin: 0.5rem 0;
        max-width: 85%;
        margin-left: auto;
    }

    .chat-assistant {
        background: #f1f5f9;
        color: #1e293b;
        padding: 1rem 1.25rem;
        border-radius: 16px 16px 16px 4px;
        margin: 0.5rem 0;
        max-width: 85%;
        border: 1px solid #e2e8f0;
    }

    /* ── Section Headers ───────────────────────────────────────────── */
    .section-header {
        font-size: 1.15rem;
        font-weight: 600;
        color: #1e293b;
        margin: 1.5rem 0 0.75rem 0;
        padding-bottom: 0.5rem;
        border-bottom: 2px solid #e2e8f0;
    }

    /* ── History Cards ─────────────────────────────────────────────── */
    .history-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 0.75rem;
        transition: all 0.2s ease;
        cursor: pointer;
    }

    .history-card:hover {
        border-color: #2d5a87;
        box-shadow: 0 4px 12px rgba(45, 90, 135, 0.1);
    }

    /* ── Sidebar ───────────────────────────────────────────────────── */
    section[data-testid="stSidebar"] {
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* ── Tab Styling ───────────────────────────────────────────────── */
    .stTabs [data-baseweb="tab-list"] {
        gap: 4px;
    }

    .stTabs [data-baseweb="tab"] {
        padding: 8px 16px;
        border-radius: 8px 8px 0 0;
        font-weight: 500;
        font-size: 0.85rem;
    }

    /* ── File uploader ─────────────────────────────────────────────── */
    .stFileUploader > div {
        border-radius: 12px;
    }

    /* ── Expander ──────────────────────────────────────────────────── */
    .streamlit-expanderHeader {
        font-weight: 600;
        font-size: 0.95rem;
    }

    /* ── Divider ───────────────────────────────────────────────────── */
    .custom-divider {
        height: 1px;
        background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
        margin: 1.5rem 0;
    }

    /* ── Type Badge ────────────────────────────────────────────────── */
    .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        background: linear-gradient(135deg, #dbeafe, #ede9fe);
        color: #1e3a5f;
        border: 1px solid #c7d2fe;
    }

    /* ── Dashboard Card ────────────────────────────────────────────── */
    .dash-card {
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .dash-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px rgba(0,0,0,0.08);
    }

    .dash-value {
        font-size: 2.2rem;
        font-weight: 700;
        margin: 0;
        line-height: 1.2;
    }

    .dash-label {
        font-size: 0.8rem;
        color: #64748b;
        margin: 0.4rem 0 0 0;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    /* ── Heatmap Card ──────────────────────────────────────────────── */
    .heatmap-cell {
        display: inline-block;
        padding: 8px 14px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        margin: 2px;
        min-width: 80px;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)


# ── Import services ─────────────────────────────────────────────────────
from services.parser import parse_document
from services.chunker import chunk_text
from services.vector_store import (
    build_vector_store,
    load_vector_store,
    vector_store_exists,
    clear_vector_store,
    search_similar_chunks,
)
from services.chatbot import chat_with_contract
from services.summarizer import summarize_contract
from services.clause_extractor import extract_clauses
from services.risk_analyzer import analyze_risks, get_risk_level, get_risk_color
from services.history import (
    init_database,
    save_contract,
    get_all_contracts,
    get_contract_by_id,
    delete_contract,
    get_contract_count,
)
from services.contract_compare import compare_contracts
from services.obligation_tracker import extract_obligations
from services.ner_extractor import extract_entities
from services.clause_library import (
    init_clause_library,
    save_clause,
    get_clauses_by_type,
    search_clauses,
    get_all_clauses,
    get_clause_types,
    delete_clause,
    get_clause_count,
)
from services.red_flag_detector import detect_red_flags
from services.compliance_checker import check_compliance
from services.negotiation import suggest_negotiations
from services.clause_recommender import recommend_clauses
from services.contract_classifier import classify_contract
from services.pdf_exporter import generate_pdf_report
from services.analytics import (
    get_dashboard_stats,
    get_risk_distribution,
    get_risk_trend,
    get_clause_frequency,
    get_contracts_summary_table,
)


# ── Initialize databases ───────────────────────────────────────────────
init_database()
init_clause_library()


# ── Session state initialization ────────────────────────────────────────
def init_session_state() -> None:
    """Initialize all session state variables."""
    defaults = {
        "contract_text": None,
        "file_name": None,
        "chunks": None,
        "faiss_index": None,
        "summary": None,
        "clauses": None,
        "risk_analysis": None,
        "risk_score": None,
        "chat_history": [],
        "analysis_complete": False,
        "processing": False,
        # New fields
        "contract_type": None,
        "obligations": None,
        "entities": None,
        "red_flags": None,
        "compliance": None,
        "negotiation_suggestions": None,
        "recommendations": None,
        "classification_detail": None,
        # Multi-contract
        "multi_contracts": {},  # filename -> {text, chunks, index, analysis}
        # Comparison
        "compare_text_a": None,
        "compare_text_b": None,
        "comparison_result": None,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


init_session_state()


# ── API key validation ──────────────────────────────────────────────────
def check_api_key() -> bool:
    """Check if the Groq API key is configured.

    Returns:
        True if the key is set, False otherwise.
    """
    api_key = os.getenv("GROQ_API_KEY")
    return bool(api_key and api_key.strip())


# ── Risk gauge chart ────────────────────────────────────────────────────
def create_risk_gauge(score: int) -> go.Figure:
    """Create a Plotly gauge chart for the risk score.

    Args:
        score: The risk score (0-100).

    Returns:
        A Plotly Figure object.
    """
    risk_level = get_risk_level(score)
    risk_color = get_risk_color(score)

    fig = go.Figure(go.Indicator(
        mode="gauge+number+delta",
        value=score,
        title={
            "text": f"Risk Score — {risk_level}",
            "font": {"size": 20, "color": "#1e293b", "family": "Inter"},
        },
        number={"font": {"size": 48, "color": risk_color, "family": "Inter"}},
        gauge={
            "axis": {
                "range": [0, 100],
                "tickwidth": 2,
                "tickcolor": "#94a3b8",
                "tickfont": {"size": 12, "family": "Inter"},
            },
            "bar": {"color": risk_color, "thickness": 0.75},
            "bgcolor": "#f1f5f9",
            "borderwidth": 0,
            "steps": [
                {"range": [0, 25], "color": "rgba(16, 185, 129, 0.15)"},
                {"range": [25, 50], "color": "rgba(245, 158, 11, 0.15)"},
                {"range": [50, 75], "color": "rgba(239, 68, 68, 0.15)"},
                {"range": [75, 100], "color": "rgba(124, 58, 237, 0.15)"},
            ],
            "threshold": {
                "line": {"color": risk_color, "width": 4},
                "thickness": 0.8,
                "value": score,
            },
        },
    ))

    fig.update_layout(
        height=300,
        margin=dict(l=30, r=30, t=60, b=20),
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        font={"family": "Inter"},
    )

    return fig


# ── Sidebar ─────────────────────────────────────────────────────────────
def render_sidebar() -> None:
    """Render the sidebar with upload and history controls."""
    with st.sidebar:
        st.markdown("### 📄 Contract Upload")
        st.caption("Upload a PDF or DOCX contract for analysis")

        uploaded_file = st.file_uploader(
            "Choose a file",
            type=["pdf", "docx"],
            help="Supported formats: PDF, DOCX",
            key="file_uploader",
        )

        if uploaded_file is not None:
            # Check if it's a new file
            if st.session_state.file_name != uploaded_file.name:
                st.session_state.file_name = uploaded_file.name
                st.session_state.analysis_complete = False
                st.session_state.summary = None
                st.session_state.clauses = None
                st.session_state.risk_analysis = None
                st.session_state.risk_score = None
                st.session_state.chat_history = []
                st.session_state.contract_type = None
                st.session_state.obligations = None
                st.session_state.entities = None
                st.session_state.red_flags = None
                st.session_state.compliance = None
                st.session_state.negotiation_suggestions = None
                st.session_state.recommendations = None
                st.session_state.classification_detail = None

                with st.spinner("📖 Extracting text..."):
                    try:
                        text, file_path = parse_document(uploaded_file)
                        st.session_state.contract_text = text
                        st.success(f"✅ Extracted {len(text):,} characters")
                    except Exception as e:
                        st.error(f"❌ {e}")
                        st.session_state.contract_text = None
                        return

                with st.spinner("🔪 Chunking text..."):
                    try:
                        chunks = chunk_text(text)
                        st.session_state.chunks = chunks
                        st.info(f"📦 Created {len(chunks)} chunks")
                    except Exception as e:
                        st.error(f"❌ Chunking failed: {e}")
                        return

                with st.spinner("🧠 Building vector index..."):
                    try:
                        index, indexed_chunks = build_vector_store(chunks)
                        st.session_state.faiss_index = index
                        st.success("✅ Vector index ready")
                    except Exception as e:
                        st.error(f"❌ Vector store error: {e}")
                        return

        st.markdown("---")

        # ── Analysis trigger ──
        if st.session_state.contract_text and not st.session_state.analysis_complete:
            if st.button("🚀 Analyze Contract", width="stretch", type="primary"):
                if not check_api_key():
                    st.error("❌ GROQ_API_KEY not set. Add it to .env file.")
                    return

                run_analysis()

        # ── Quick stats ──
        if st.session_state.analysis_complete:
            st.markdown("### 📊 Quick Stats")
            col1, col2 = st.columns(2)
            with col1:
                st.metric("Chunks", len(st.session_state.chunks or []))
            with col2:
                score = st.session_state.risk_score
                if score is not None:
                    st.metric("Risk Score", f"{score}/100")

            if st.session_state.contract_type:
                st.markdown(
                    f'<span class="type-badge">📋 {st.session_state.contract_type}</span>',
                    unsafe_allow_html=True,
                )

            st.markdown("---")

            # PDF Export button
            if st.button("📥 Download PDF Report", width="stretch"):
                with st.spinner("Generating PDF..."):
                    try:
                        pdf_bytes = generate_pdf_report(
                            filename=st.session_state.file_name or "contract",
                            summary=st.session_state.summary,
                            clauses=st.session_state.clauses,
                            risk_analysis=st.session_state.risk_analysis,
                            risk_score=st.session_state.risk_score,
                            contract_type=st.session_state.contract_type,
                            obligations=st.session_state.obligations,
                            entities=st.session_state.entities,
                            red_flags=st.session_state.red_flags,
                            compliance=st.session_state.compliance,
                            negotiations=st.session_state.negotiation_suggestions,
                        )
                        st.download_button(
                            "💾 Save PDF",
                            data=pdf_bytes,
                            file_name=f"report_{st.session_state.file_name or 'contract'}.pdf",
                            mime="application/pdf",
                            width="stretch",
                        )
                    except Exception as e:
                        st.error(f"❌ PDF generation failed: {e}")

        st.markdown("---")

        # ── History ──
        st.markdown("### 📚 History")
        count = get_contract_count()
        st.caption(f"{count} contract{'s' if count != 1 else ''} analyzed")

        contracts = get_all_contracts()
        if contracts:
            for contract in contracts[:10]:
                col_name, col_btn = st.columns([3, 1])
                with col_name:
                    ctype = contract.get('contract_type', '')
                    type_tag = f" • {ctype}" if ctype else ""
                    st.markdown(
                        f"**{contract['filename'][:25]}**{type_tag}\n\n"
                        f"<small style='color:#64748b'>{contract['upload_time']}</small>",
                        unsafe_allow_html=True,
                    )
                with col_btn:
                    if st.button("👁", key=f"view_{contract['id']}", help="View analysis"):
                        load_historical_contract(contract["id"])


def run_analysis() -> None:
    """Run the full contract analysis pipeline."""
    text = st.session_state.contract_text

    progress = st.sidebar.progress(0, text="Starting analysis...")

    try:
        # Classification
        progress.progress(5, text="🏷️ Classifying contract...")
        contract_type, classification_detail = classify_contract(text)
        st.session_state.contract_type = contract_type
        st.session_state.classification_detail = classification_detail

        # Summary
        progress.progress(15, text="📝 Generating summary...")
        st.session_state.summary = summarize_contract(text)

        # Clauses
        progress.progress(25, text="📋 Extracting clauses...")
        st.session_state.clauses = extract_clauses(text)

        # Risk Analysis
        progress.progress(35, text="⚠️ Analyzing risks...")
        risk_analysis, risk_score = analyze_risks(text)
        st.session_state.risk_analysis = risk_analysis
        st.session_state.risk_score = risk_score

        # Obligations
        progress.progress(45, text="📅 Extracting obligations...")
        st.session_state.obligations = extract_obligations(text)

        # NER
        progress.progress(55, text="🔍 Extracting entities...")
        st.session_state.entities = extract_entities(text)

        # Red Flags
        progress.progress(65, text="🚩 Detecting red flags...")
        st.session_state.red_flags = detect_red_flags(text)

        # Compliance
        progress.progress(72, text="🛡️ Checking compliance...")
        st.session_state.compliance = check_compliance(text)

        # Negotiation
        progress.progress(80, text="🤝 Generating suggestions...")
        st.session_state.negotiation_suggestions = suggest_negotiations(text)

        # Recommendations
        progress.progress(88, text="💡 Finding missing clauses...")
        st.session_state.recommendations = recommend_clauses(text)

        # Save to database
        progress.progress(94, text="💾 Saving to database...")
        save_contract(
            filename=st.session_state.file_name,
            summary=st.session_state.summary,
            clauses=st.session_state.clauses,
            risk_analysis=st.session_state.risk_analysis,
            risk_score=st.session_state.risk_score,
            contract_type=st.session_state.contract_type,
            obligations=st.session_state.obligations,
            entities=st.session_state.entities,
            red_flags=st.session_state.red_flags,
            compliance=st.session_state.compliance,
            negotiation_suggestions=st.session_state.negotiation_suggestions,
        )

        progress.progress(100, text="✅ Analysis complete!")
        st.session_state.analysis_complete = True
        st.rerun()

    except RuntimeError as e:
        st.sidebar.error(f"❌ API Error: {e}")
    except Exception as e:
        st.sidebar.error(f"❌ Analysis failed: {e}")


def load_historical_contract(contract_id: int) -> None:
    """Load a previously analyzed contract from the database.

    Args:
        contract_id: The database ID of the contract record.
    """
    record = get_contract_by_id(contract_id)
    if record:
        st.session_state.file_name = record["filename"]
        st.session_state.summary = record["summary"]
        st.session_state.clauses = record["clauses"]
        st.session_state.risk_analysis = record["risk_analysis"]
        st.session_state.risk_score = record["risk_score"]
        st.session_state.contract_type = record.get("contract_type")
        st.session_state.obligations = record.get("obligations")
        st.session_state.entities = record.get("entities")
        st.session_state.red_flags = record.get("red_flags")
        st.session_state.compliance = record.get("compliance")
        st.session_state.negotiation_suggestions = record.get("negotiation_suggestions")
        st.session_state.analysis_complete = True
        st.session_state.contract_text = None  # No raw text from history
        st.session_state.chat_history = []
        st.rerun()


# ── Main Content ────────────────────────────────────────────────────────
def render_header() -> None:
    """Render the main page header."""
    st.markdown("""
    <div class="main-header">
         <h1>📄 Contract Intelligence Platform</h1>
         <p>AI-powered contract analysis • Powered by Groq Llama 3.3 & FAISS</p>
    </div>
    """, unsafe_allow_html=True)


def render_welcome() -> None:
    """Render the welcome screen when no contract is loaded."""
    st.markdown("<br>", unsafe_allow_html=True)

    # Feature cards row 1
    col1, col2, col3, col4 = st.columns(4)
    features_row1 = [
        ("📝", "Smart Summaries"),
        ("⚖️", "Clause Extraction"),
        ("🛡️", "Risk Analysis"),
        ("💬", "Contract Chat"),
    ]
    for col, (icon, label) in zip([col1, col2, col3, col4], features_row1):
        with col:
            st.markdown(f"""
            <div class="metric-card">
                <p class="metric-value">{icon}</p>
                <p class="metric-label">{label}</p>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Feature cards row 2
    col1, col2, col3, col4 = st.columns(4)
    features_row2 = [
        ("🔍", "Entity Recognition"),
        ("🚩", "Red Flag Detection"),
        ("🛡️", "Compliance Check"),
        ("🤝", "AI Negotiation"),
    ]
    for col, (icon, label) in zip([col1, col2, col3, col4], features_row2):
        with col:
            st.markdown(f"""
            <div class="metric-card">
                <p class="metric-value">{icon}</p>
                <p class="metric-label">{label}</p>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Feature cards row 3
    col1, col2, col3, col4 = st.columns(4)
    features_row3 = [
        ("📊", "Executive Dashboard"),
        ("📥", "PDF Export"),
        ("📚", "Clause Library"),
        ("🔎", "Semantic Search"),
    ]
    for col, (icon, label) in zip([col1, col2, col3, col4], features_row3):
        with col:
            st.markdown(f"""
            <div class="metric-card">
                <p class="metric-value">{icon}</p>
                <p class="metric-label">{label}</p>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)
    st.info(
        "👈 **Upload a contract** using the sidebar to get started. "
        "Supported formats: PDF, DOCX."
    )

    # Show dashboard if there's historical data
    if get_contract_count() > 0:
        st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
        render_dashboard_section()


def render_analysis() -> None:
    """Render the analysis results with tabs."""
    # ── File info bar ──
    type_tag = ""
    if st.session_state.contract_type:
        type_tag = f' <span class="type-badge">📋 {st.session_state.contract_type}</span>'
    st.markdown(
        f'<p class="section-header">📄 {st.session_state.file_name}{type_tag}</p>',
        unsafe_allow_html=True,
    )

    # ── Top metrics ──
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        chunks_count = len(st.session_state.chunks) if st.session_state.chunks else "—"
        st.markdown(f"""
        <div class="metric-card">
            <p class="metric-value">{chunks_count}</p>
            <p class="metric-label">Text Chunks</p>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        score = st.session_state.risk_score
        display_score = f"{score}" if score is not None else "—"
        st.markdown(f"""
        <div class="metric-card">
            <p class="metric-value">{display_score}</p>
            <p class="metric-label">Risk Score</p>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        risk_level = get_risk_level(score) if score is not None else "—"
        st.markdown(f"""
        <div class="metric-card">
            <p class="metric-value">{risk_level}</p>
            <p class="metric-label">Risk Level</p>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        text_len = f"{len(st.session_state.contract_text):,}" if st.session_state.contract_text else "—"
        st.markdown(f"""
        <div class="metric-card">
            <p class="metric-value">{text_len}</p>
            <p class="metric-label">Characters</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)

    # ── Tabs ──
    (
        tab_summary,
        tab_clauses,
        tab_risks,
        tab_obligations,
        tab_ner,
        tab_redflags,
        tab_compliance,
        tab_negotiate,
        tab_recommend,
        tab_compare,
        tab_search,
        tab_library,
        tab_timeline,
        tab_chat,
        tab_dashboard,
    ) = st.tabs([
        "📝 Summary",
        "📋 Clauses",
        "⚠️ Risks",
        "📅 Obligations",
        "🔍 Entities",
        "🚩 Red Flags",
        "🛡️ Compliance",
        "🤝 Negotiate",
        "💡 Recommend",
        "🔄 Compare",
        "🔎 Search",
        "📚 Library",
        "📈 Timeline",
        "💬 Chat",
        "📊 Dashboard",
    ])

    # ── Summary Tab ──
    with tab_summary:
        if st.session_state.summary:
            st.markdown(st.session_state.summary)
        else:
            st.info("Summary not yet generated. Click **Analyze Contract** in the sidebar.")

        if st.session_state.classification_detail:
            with st.expander("🏷️ Classification Details", expanded=False):
                st.markdown(st.session_state.classification_detail)

        # Show raw extracted text
        if st.session_state.contract_text:
            with st.expander("📖 View Extracted Text", expanded=False):
                st.text_area(
                    "Raw Text",
                    st.session_state.contract_text,
                    height=300,
                    disabled=True,
                    label_visibility="collapsed",
                )

    # ── Clauses Tab ──
    with tab_clauses:
        if st.session_state.clauses:
            st.markdown(st.session_state.clauses)

            # Save clause to library
            st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
            st.markdown("#### ➕ Save a Clause to Library")
            clause_type = st.text_input("Clause Type", placeholder="e.g., Confidentiality, Termination")
            clause_text = st.text_area("Clause Text", placeholder="Paste the clause text here...")
            if st.button("💾 Save to Library", key="save_clause_btn"):
                if clause_type and clause_text:
                    save_clause(clause_type, clause_text, st.session_state.file_name)
                    st.success(f"✅ Saved '{clause_type}' clause to library!")
                else:
                    st.warning("Please fill in both fields.")
        else:
            st.info("Clauses not yet extracted. Click **Analyze Contract** in the sidebar.")

    # ── Risks Tab ──
    with tab_risks:
        if st.session_state.risk_score is not None:
            # Gauge chart
            col_gauge, col_info = st.columns([2, 1])
            with col_gauge:
                fig = create_risk_gauge(st.session_state.risk_score)
                st.plotly_chart(fig, width="stretch")
            with col_info:
                score = st.session_state.risk_score
                level = get_risk_level(score)
                color = get_risk_color(score)

                if level == "Low":
                    badge_class = "status-low"
                elif level == "Medium":
                    badge_class = "status-medium"
                elif level == "High":
                    badge_class = "status-high"
                else:
                    badge_class = "status-critical"

                st.markdown(f"""
                <div style="padding: 1.5rem 0;">
                    <h3 style="margin: 0 0 0.5rem 0; color: #1e293b;">Risk Assessment</h3>
                    <span class="status-badge {badge_class}">● {level} Risk</span>
                    <div style="margin-top: 1.5rem;">
                        <p style="color: #64748b; font-size: 0.85rem; margin: 0;">
                            Score Range:
                        </p>
                        <p style="color: #1e293b; font-weight: 500; margin: 0.25rem 0;">
                            0-25 Low • 26-50 Medium<br>
                            51-75 High • 76-100 Critical
                        </p>
                    </div>
                </div>
                """, unsafe_allow_html=True)

            st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)

        if st.session_state.risk_analysis:
            st.markdown(st.session_state.risk_analysis)

            # Risk Heatmap
            st.markdown("#### 🗺️ Risk Heatmap")
            risk_categories = ["Financial", "Legal", "Operational", "Compliance", "Reputational"]
            severity_levels = ["Low", "Medium", "High", "Critical"]
            severity_colors = {
                "Low": "#d1fae5",
                "Medium": "#fef3c7",
                "High": "#fee2e2",
                "Critical": "#ede9fe",
            }
            severity_text_colors = {
                "Low": "#065f46",
                "Medium": "#92400e",
                "High": "#991b1b",
                "Critical": "#5b21b6",
            }

            # Parse risk analysis to build heatmap data
            heatmap_html = '<div style="overflow-x: auto;">'
            heatmap_html += '<table style="border-collapse: separate; border-spacing: 4px;">'
            heatmap_html += '<tr><th style="padding: 8px; color: #64748b; font-size: 0.8rem;"></th>'
            for sev in severity_levels:
                heatmap_html += f'<th style="padding: 8px; color: #64748b; font-size: 0.8rem; text-align: center;">{sev}</th>'
            heatmap_html += '</tr>'

            for cat in risk_categories:
                heatmap_html += f'<tr><td style="padding: 8px; font-weight: 600; color: #1e293b; font-size: 0.85rem;">{cat}</td>'
                for sev in severity_levels:
                    # Check if this combination exists in risk analysis
                    found = False
                    if st.session_state.risk_analysis:
                        if cat.lower() in st.session_state.risk_analysis.lower() and sev.lower() in st.session_state.risk_analysis.lower():
                            found = True
                    bg = severity_colors[sev] if found else "#f8fafc"
                    tc = severity_text_colors[sev] if found else "#cbd5e1"
                    icon = "●" if found else "○"
                    heatmap_html += f'<td style="background: {bg}; color: {tc}; padding: 8px 14px; border-radius: 8px; text-align: center; font-weight: 600; font-size: 0.85rem;">{icon}</td>'
                heatmap_html += '</tr>'
            heatmap_html += '</table></div>'
            st.markdown(heatmap_html, unsafe_allow_html=True)
        else:
            st.info("Risk analysis not yet performed. Click **Analyze Contract** in the sidebar.")

    # ── Obligations Tab ──
    with tab_obligations:
        if st.session_state.obligations:
            st.markdown(st.session_state.obligations)
        else:
            st.info("Obligations not yet extracted. Click **Analyze Contract** in the sidebar.")

    # ── NER Tab ──
    with tab_ner:
        if st.session_state.entities:
            st.markdown(st.session_state.entities)
        else:
            st.info("Entities not yet extracted. Click **Analyze Contract** in the sidebar.")

    # ── Red Flags Tab ──
    with tab_redflags:
        if st.session_state.red_flags:
            st.markdown(st.session_state.red_flags)
        else:
            st.info("Red flag detection not yet performed. Click **Analyze Contract** in the sidebar.")

    # ── Compliance Tab ──
    with tab_compliance:
        if st.session_state.compliance:
            st.markdown(st.session_state.compliance)
        else:
            st.info("Compliance check not yet performed. Click **Analyze Contract** in the sidebar.")

    # ── Negotiation Tab ──
    with tab_negotiate:
        if st.session_state.negotiation_suggestions:
            st.markdown(st.session_state.negotiation_suggestions)
        else:
            st.info("Negotiation suggestions not yet generated. Click **Analyze Contract** in the sidebar.")

    # ── Recommendations Tab ──
    with tab_recommend:
        if st.session_state.recommendations:
            st.markdown(st.session_state.recommendations)
        else:
            st.info("Clause recommendations not yet generated. Click **Analyze Contract** in the sidebar.")

    # ── Compare Tab ──
    with tab_compare:
        render_compare_tab()

    # ── Semantic Search Tab ──
    with tab_search:
        render_search_tab()

    # ── Clause Library Tab ──
    with tab_library:
        render_library_tab()

    # ── Timeline Tab ──
    with tab_timeline:
        render_timeline_tab()

    # ── Chat Tab ──
    with tab_chat:
        render_chat_tab()

    # ── Dashboard Tab ──
    with tab_dashboard:
        render_dashboard_section()


def render_compare_tab() -> None:
    """Render the contract comparison interface."""
    st.markdown("#### 🔄 Contract Comparison")
    st.caption("Upload a second contract to compare against the current one.")

    if not st.session_state.contract_text:
        st.warning("Please upload a primary contract first.")
        return

    compare_file = st.file_uploader(
        "Upload comparison contract",
        type=["pdf", "docx"],
        key="compare_uploader",
    )

    if compare_file:
        with st.spinner("Extracting comparison text..."):
            try:
                compare_text, _ = parse_document(compare_file)
                st.session_state.compare_text_b = compare_text
                st.success(f"✅ Extracted {len(compare_text):,} characters from comparison contract")
            except Exception as e:
                st.error(f"❌ {e}")
                return

    if st.session_state.compare_text_b:
        if st.button("🔍 Compare Contracts", type="primary", key="compare_btn"):
            with st.spinner("Comparing contracts..."):
                try:
                    result = compare_contracts(
                        st.session_state.contract_text,
                        st.session_state.compare_text_b,
                    )
                    st.session_state.comparison_result = result
                except Exception as e:
                    st.error(f"❌ Comparison failed: {e}")

    if st.session_state.comparison_result:
        st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
        st.markdown(st.session_state.comparison_result)


def render_search_tab() -> None:
    """Render the semantic search interface."""
    st.markdown("#### 🔎 Semantic Search")
    st.caption("Search through the contract using natural language queries.")

    if st.session_state.faiss_index is None or st.session_state.chunks is None:
        st.warning("Semantic search requires a vector index. Please upload a contract first.")
        return

    search_query = st.text_input(
        "Search query",
        placeholder="e.g., What are the payment terms?",
        key="semantic_search_input",
    )

    top_k = st.slider("Number of results", min_value=1, max_value=10, value=5, key="search_k")

    if search_query:
        with st.spinner("Searching..."):
            results = search_similar_chunks(
                search_query,
                st.session_state.faiss_index,
                st.session_state.chunks,
                top_k=top_k,
            )

        if results:
            for i, result in enumerate(results, 1):
                score_pct = result["score"] * 100
                score_color = "#10B981" if score_pct > 70 else "#F59E0B" if score_pct > 40 else "#EF4444"
                st.markdown(
                    f'**Result {i}** — '
                    f'<span style="color: {score_color}; font-weight: 600;">Relevance: {score_pct:.1f}%</span>',
                    unsafe_allow_html=True,
                )
                st.text_area(
                    f"Chunk {i}",
                    result["text"],
                    height=120,
                    disabled=True,
                    label_visibility="collapsed",
                    key=f"search_result_{i}",
                )
                st.markdown("---")
        else:
            st.info("No relevant results found.")


def render_library_tab() -> None:
    """Render the clause library interface."""
    st.markdown("#### 📚 Clause Library")
    st.caption("Browse and search your saved clause library.")

    # Stats
    total_clauses = get_clause_count()
    clause_types = get_clause_types()
    col1, col2 = st.columns(2)
    with col1:
        st.metric("Total Clauses", total_clauses)
    with col2:
        st.metric("Clause Types", len(clause_types))

    st.markdown("---")

    # Search
    lib_search = st.text_input("Search clauses", placeholder="Search by type or text...", key="lib_search")

    if lib_search:
        results = search_clauses(lib_search)
    else:
        results = get_all_clauses()

    if results:
        for clause in results:
            with st.expander(f"📋 {clause['clause_type']} — {clause.get('source_contract', 'Unknown source')}"):
                st.markdown(clause["clause_text"])
                st.caption(f"Added: {clause['created_at']}")
                if st.button("🗑️ Delete", key=f"del_clause_{clause['id']}"):
                    delete_clause(clause["id"])
                    st.rerun()
    else:
        st.info("No clauses in the library yet. Save clauses from the Clauses tab.")


def render_timeline_tab() -> None:
    """Render the timeline visualization."""
    st.markdown("#### 📈 Timeline Visualization")

    if not st.session_state.obligations:
        st.info("Timeline requires obligation analysis. Click **Analyze Contract** first.")
        return

    # Parse dates from obligations text for visualization
    st.markdown("##### Key Dates from Obligations")
    st.markdown(st.session_state.obligations)

    # Also show risk trend across all contracts
    st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
    st.markdown("##### 📊 Risk Score Trend (All Contracts)")

    trend_data = get_risk_trend()
    if trend_data["dates"]:
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=trend_data["dates"],
            y=trend_data["scores"],
            mode="lines+markers",
            name="Risk Score",
            line=dict(color="#2d5a87", width=3),
            marker=dict(size=8, color="#1e3a5f"),
            text=trend_data["filenames"],
            hovertemplate="<b>%{text}</b><br>Date: %{x}<br>Risk: %{y}/100<extra></extra>",
        ))

        # Add risk zone bands
        fig.add_hrect(y0=0, y1=25, fillcolor="rgba(16,185,129,0.08)", line_width=0)
        fig.add_hrect(y0=25, y1=50, fillcolor="rgba(245,158,11,0.08)", line_width=0)
        fig.add_hrect(y0=50, y1=75, fillcolor="rgba(239,68,68,0.08)", line_width=0)
        fig.add_hrect(y0=75, y1=100, fillcolor="rgba(124,58,237,0.08)", line_width=0)

        fig.update_layout(
            height=350,
            margin=dict(l=20, r=20, t=30, b=20),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            yaxis=dict(title="Risk Score", range=[0, 100]),
            xaxis=dict(title=""),
            font=dict(family="Inter"),
        )
        st.plotly_chart(fig, width="stretch")
    else:
        st.info("No historical data available for trend analysis.")


def render_chat_tab() -> None:
    """Render the RAG chat interface with citations."""
    if st.session_state.faiss_index is None or st.session_state.chunks is None:
        st.warning(
            "💬 Chat requires the vector index. "
            "Please upload a new contract to enable chat."
        )
        return

    if not check_api_key():
        st.error("❌ GROQ_API_KEY not set. Add it to your .env file.")
        return

    # Display chat history
    for msg in st.session_state.chat_history:
        if msg["role"] == "user":
            st.markdown(
                f'<div class="chat-user">{msg["content"]}</div>',
                unsafe_allow_html=True,
            )
        else:
            with st.container():
                st.markdown(msg["content"])
                if msg.get("sources"):
                    with st.expander("📎 Source Chunks", expanded=False):
                        for i, source in enumerate(msg["sources"], 1):
                            st.markdown(
                                f"**Chunk {i}** (score: {source['score']:.3f})"
                            )
                            st.text(source["text"][:300] + "..." if len(source["text"]) > 300 else source["text"])
                            st.markdown("---")

    # Chat input
    question = st.chat_input(
        "Ask a question about the contract...",
        key="chat_input",
    )

    if question:
        # Add user message
        st.session_state.chat_history.append({
            "role": "user",
            "content": question,
        })

        # Generate response
        with st.spinner("🤔 Thinking..."):
            try:
                answer, sources = chat_with_contract(
                    question=question,
                    index=st.session_state.faiss_index,
                    chunks=st.session_state.chunks,
                    top_k=3,
                )

                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": answer,
                    "sources": sources,
                })

            except Exception as e:
                st.session_state.chat_history.append({
                    "role": "assistant",
                    "content": f"❌ Error: {e}",
                    "sources": [],
                })

        st.rerun()


def render_dashboard_section() -> None:
    """Render the executive dashboard with analytics."""
    st.markdown("#### 📊 Executive Dashboard")

    stats = get_dashboard_stats()

    # Top metrics row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown(f"""
        <div class="dash-card">
            <p class="dash-value" style="color: #1e3a5f;">{stats['total_contracts']}</p>
            <p class="dash-label">Total Contracts</p>
        </div>
        """, unsafe_allow_html=True)
    with col2:
        avg_color = get_risk_color(int(stats['avg_risk_score'])) if stats['avg_risk_score'] else "#64748b"
        st.markdown(f"""
        <div class="dash-card">
            <p class="dash-value" style="color: {avg_color};">{stats['avg_risk_score']}</p>
            <p class="dash-label">Avg Risk Score</p>
        </div>
        """, unsafe_allow_html=True)
    with col3:
        high_risk = stats['high_risk_count'] + stats['critical_risk_count']
        st.markdown(f"""
        <div class="dash-card">
            <p class="dash-value" style="color: #EF4444;">{high_risk}</p>
            <p class="dash-label">High Risk Contracts</p>
        </div>
        """, unsafe_allow_html=True)
    with col4:
        st.markdown(f"""
        <div class="dash-card">
            <p class="dash-value" style="color: #7C3AED;">{stats['total_clauses']}</p>
            <p class="dash-label">Library Clauses</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("<br>", unsafe_allow_html=True)

    # Charts row
    col_chart1, col_chart2 = st.columns(2)

    with col_chart1:
        st.markdown("##### Risk Distribution")
        dist = get_risk_distribution()
        if any(v > 0 for v in dist["values"]):
            fig = go.Figure(data=[go.Pie(
                labels=dist["labels"],
                values=dist["values"],
                marker_colors=dist["colors"],
                hole=0.45,
                textinfo="label+value",
                textfont=dict(size=13, family="Inter"),
            )])
            fig.update_layout(
                height=320,
                margin=dict(l=20, r=20, t=20, b=20),
                paper_bgcolor="rgba(0,0,0,0)",
                font=dict(family="Inter"),
                showlegend=False,
            )
            st.plotly_chart(fig, width="stretch")
        else:
            st.info("No risk data available yet.")

    with col_chart2:
        st.markdown("##### Risk Score Trend")
        trend = get_risk_trend()
        if trend["dates"]:
            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=trend["dates"],
                y=trend["scores"],
                mode="lines+markers+text",
                name="Risk",
                line=dict(color="#2d5a87", width=2.5),
                marker=dict(size=7, color="#1e3a5f"),
                text=trend["filenames"],
                hovertemplate="<b>%{text}</b><br>Risk: %{y}<extra></extra>",
            ))
            fig.update_layout(
                height=320,
                margin=dict(l=20, r=20, t=20, b=20),
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                yaxis=dict(range=[0, 100]),
                font=dict(family="Inter"),
            )
            st.plotly_chart(fig, width="stretch")
        else:
            st.info("No trend data available yet.")

    # Clause frequency
    st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
    st.markdown("##### Clause Library Distribution")
    freq = get_clause_frequency()
    if freq["types"]:
        fig = go.Figure(data=[go.Bar(
            x=freq["types"],
            y=freq["counts"],
            marker_color="#2d5a87",
            text=freq["counts"],
            textposition="auto",
        )])
        fig.update_layout(
            height=300,
            margin=dict(l=20, r=20, t=20, b=20),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Inter"),
        )
        st.plotly_chart(fig, width="stretch")
    else:
        st.info("No clauses in the library yet.")

    # Contracts table
    st.markdown('<div class="custom-divider"></div>', unsafe_allow_html=True)
    st.markdown("##### All Contracts")
    table_data = get_contracts_summary_table()
    if table_data:
        import pandas as pd
        df = pd.DataFrame(table_data)
        df.columns = ["Filename", "Upload Time", "Risk Score", "Risk Level", "Contract Type"]
        st.dataframe(df, use_container_width=True, hide_index=True)
    else:
        st.info("No contracts analyzed yet.")


# ── Main ────────────────────────────────────────────────────────────────
def main() -> None:
    """Main application entry point."""
    render_sidebar()
    render_header()

    if not check_api_key():
        st.warning(
            "⚠️ **GROQ_API_KEY is not configured.** "
            "Please add your Groq API key to the `.env` file:\n\n"
            "```\nGROQ_API_KEY=your_key_here\n```"
        )

    if st.session_state.analysis_complete:
        render_analysis()
    else:
        render_welcome()


if __name__ == "__main__":
    main()