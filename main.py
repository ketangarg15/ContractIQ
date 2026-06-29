"""
FastAPI Backend for Contract Intelligence Platform.
"""

import os
import json
import asyncio
from pathlib import Path
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel

# Database services
from services.history import (
    init_database,
    save_contract,
    get_all_contracts,
    get_contract_by_id,
    delete_contract,
    _get_session,
    ContractRecord,
    create_user,
    authenticate_user,
    UserRecord,
)
from services.clause_library import (
    init_clause_library,
    save_clause as save_clause_to_db,
    get_all_clauses,
    delete_clause as delete_clause_from_db,
    ClauseRecord,
)

# Pipeline services
from services.contract_classifier import classify_contract
from services.summarizer import summarize_contract
from services.clause_extractor import extract_clauses
from services.risk_analyzer import analyze_risks
from services.obligation_tracker import extract_obligations
from services.ner_extractor import extract_entities
from services.red_flag_detector import detect_red_flags
from services.compliance_checker import check_compliance
from services.negotiation import suggest_negotiations

# Utilities and Vector Store
from services.chunker import chunk_text
from services.vector_store import (
    build_vector_store,
    load_vector_store,
    search_similar_chunks,
    clear_vector_store,
)
from services.chatbot import chat_with_contract
from services.contract_compare import compare_contracts
from services.pdf_exporter import generate_pdf_report
from services.analytics import (
    get_dashboard_stats,
    get_risk_distribution,
    get_clause_frequency,
    get_contracts_summary_table,
)

from utils.pdf_utils import extract_text

app = FastAPI(title="Lexora AI Contract Intelligence API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize databases on start
@app.on_event("startup")
def startup_event():
    init_database()
    init_clause_library()
    # Create required folders
    Path("uploads").mkdir(exist_ok=True)
    Path("contract_texts").mkdir(exist_ok=True)


@app.post("/api/contracts/upload")
async def upload_contract(file: UploadFile = File(...), x_username: Optional[str] = Header(None)):
    """Upload a contract, extract text, chunk it, and save blank database entry."""
    filename = file.filename
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    file_path = uploads_dir / filename

    # Save uploaded file
    try:
        content = await file.read()
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Extract text
    try:
        text = extract_text(file_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract text: {str(e)}")

    # Create SQLite database entry to generate contract ID
    session = _get_session()
    try:
        record = ContractRecord(filename=filename, username=x_username)
        session.add(record)
        session.commit()
        contract_id = record.id
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        session.close()

    # Chunk text & build vector store scoped by contract_id
    try:
        chunks = chunk_text(text)
        build_vector_store(chunks, contract_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to build vector store: {str(e)}")

    # Save raw text locally for pipeline reference
    text_dir = Path("contract_texts")
    text_dir.mkdir(exist_ok=True)
    with open(text_dir / f"{contract_id}.txt", "w", encoding="utf-8") as f:
        f.write(text)

    return {
        "contract_id": contract_id,
        "filename": filename,
        "char_count": len(text),
        "chunk_count": len(chunks),
    }


@app.get("/api/contracts/{contract_id}/analyze")
async def analyze_contract(contract_id: int):
    """Run full analysis pipeline and stream status progress via Server-Sent Events."""
    text_path = Path("contract_texts") / f"{contract_id}.txt"
    if not text_path.exists():
        raise HTTPException(status_code=404, detail="Contract text not found. Upload first.")

    with open(text_path, "r", encoding="utf-8") as f:
        text = f.read()

    async def run_pipeline():
        try:
            # 1. Classification
            yield f"data: {json.dumps({'stage': 'classifying', 'message': 'Classifying contract type...'})}\n\n"
            classification = classify_contract(text)
            await asyncio.sleep(0.1)

            # 2. Summary
            yield f"data: {json.dumps({'stage': 'summarizing', 'message': 'Summarizing contract narrative...'})}\n\n"
            summary = summarize_contract(text)
            await asyncio.sleep(0.1)

            # 3. Clauses
            yield f"data: {json.dumps({'stage': 'extracting clauses', 'message': 'Extracting key legal clauses...'})}\n\n"
            clauses = extract_clauses(text)
            await asyncio.sleep(0.1)

            # 4. Red Flags (must run before risk + negotiation for consistency)
            yield f"data: {json.dumps({'stage': 'red flags', 'message': 'Scanning contract for critical red flags...'})}\n\n"
            red_flags = detect_red_flags(text)
            red_flags_json = red_flags.model_dump_json()
            await asyncio.sleep(0.1)

            # 5. Risk (uses red flags context for score consistency)
            yield f"data: {json.dumps({'stage': 'analyzing risk', 'message': 'Analyzing risk profile and composite score...'})}\n\n"
            risk = analyze_risks(text, red_flags_context=red_flags_json)
            await asyncio.sleep(0.1)

            # 6. Obligations
            yield f"data: {json.dumps({'stage': 'obligations', 'message': 'Extracting and tracking due dates/obligations...'})}\n\n"
            obligations = extract_obligations(text)
            await asyncio.sleep(0.1)

            # 7. Entities
            yield f"data: {json.dumps({'stage': 'entities', 'message': 'Running named entity recognition...'})}\n\n"
            entities = extract_entities(text)
            await asyncio.sleep(0.1)

            # 8. Compliance
            yield f"data: {json.dumps({'stage': 'compliance', 'message': 'Running GDPR, HIPAA, and PCI DSS compliance audits...'})}\n\n"
            compliance = check_compliance(text)
            await asyncio.sleep(0.1)

            # 9. Negotiation (uses red flags context for prioritization)
            yield f"data: {json.dumps({'stage': 'negotiation', 'message': 'Generating optimal negotiation wording suggestions...'})}\n\n"
            negotiation = suggest_negotiations(text, red_flags_context=red_flags_json)
            await asyncio.sleep(0.1)

            # 10. Saving to DB
            yield f"data: {json.dumps({'stage': 'saving', 'message': 'Persisting analysis bundle...'})}\n\n"
            session = _get_session()
            try:
                record = session.query(ContractRecord).filter_by(id=contract_id).first()
                if record:
                    record.contract_type = classification.contract_type
                    record.summary = summary.model_dump_json()
                    record.clauses = clauses.model_dump_json()
                    record.risk_analysis = risk.model_dump_json()
                    record.risk_score = float(risk.risk_score)
                    record.obligations = obligations.model_dump_json()
                    record.entities = entities.model_dump_json()
                    record.red_flags = red_flags.model_dump_json()
                    record.compliance = compliance.model_dump_json()
                    record.negotiation_suggestions = negotiation.model_dump_json()
                    session.commit()
            finally:
                session.close()

            yield f"data: {json.dumps({'stage': 'completed', 'message': 'Analysis complete!', 'contract_id': contract_id})}\n\n"

        except Exception as e:
            yield f"data: {json.dumps({'stage': 'error', 'message': f'Analysis failed: {str(e)}'})}\n\n"

    return StreamingResponse(run_pipeline(), media_type="text/event-stream")


def _try_parse_json(text_val: Optional[str]) -> Optional[dict]:
    """Helper to parse DB Text columns back to Dicts if they are JSON."""
    if not text_val:
        return None
    try:
        return json.loads(text_val)
    except Exception:
        return text_val


def map_contract_to_frontend(c):
    if not c:
        return None
    
    def parse_field(val):
        if isinstance(val, str):
            try:
                return json.loads(val)
            except Exception:
                return val
        return val

    summary = parse_field(c.get("summary"))
    clauses_data = parse_field(c.get("clauses"))
    risk_analysis = parse_field(c.get("risk_analysis"))
    obligations_data = parse_field(c.get("obligations"))
    entities_data = parse_field(c.get("entities"))
    red_flags = parse_field(c.get("red_flags"))
    compliance_data = parse_field(c.get("compliance"))
    negotiation = parse_field(c.get("negotiation_suggestions"))

    counterparty = "Unknown Counterparty"
    if entities_data and isinstance(entities_data, dict) and "entities" in entities_data:
        orgs = [e["text"] for e in entities_data["entities"] if e.get("type") == "Organization"]
        if orgs:
            counterparty = orgs[0]

    mapped_clauses = []
    if clauses_data and isinstance(clauses_data, dict) and "clauses" in clauses_data:
        for idx, cl in enumerate(clauses_data["clauses"]):
            c_type = cl.get("clause_type", "")
            c_cat = cl.get("category", "")
            risk_level = "Low"
            recommendation = ""
            suggested_wording = ""
            score = 20
            
            if negotiation and isinstance(negotiation, dict) and "suggestions" in negotiation:
                for sug in negotiation["suggestions"]:
                    if sug.get("clause_name") == c_type or sug.get("clause_name") == c_cat:
                        risk_level = "High" if sug.get("priority") == "High" else "Medium"
                        recommendation = sug.get("rationale", "")
                        suggested_wording = sug.get("suggested_wording", "")
                        score = 80 if risk_level == "High" else 55
                        break
            
            if red_flags and isinstance(red_flags, dict) and "flags" in red_flags:
                for rf in red_flags["flags"]:
                    if rf.get("title") == c_type or rf.get("location") == cl.get("reference"):
                        risk_level = rf.get("severity", "Medium")
                        recommendation = rf.get("recommendation", "")
                        score = 90 if risk_level == "Critical" else (75 if risk_level == "High" else 50)
                        break

            mapped_clauses.append({
                "id": f"c_{idx}",
                "name": c_type or c_cat or "Clause",
                "text": cl.get("extracted_text", ""),
                "riskLevel": risk_level,
                "confidenceLevel": "High",
                "status": "Needs Review" if risk_level in ["High", "Critical"] else "Confirmed",
                "score": score,
                "explanation": cl.get("summary", ""),
                "recommendation": recommendation,
                "suggestedWording": suggested_wording
            })

    mapped_summary = {
        "executiveSummary": summary.get("narrative", "") if summary else "",
        "obligations": [],
        "deadlines": [],
        "financialCommitments": [],
        "renewalTerms": [],
        "terminationConditions": [],
        "topRisks": [],
        "recommendedNextSteps": []
    }
    
    if obligations_data and isinstance(obligations_data, dict) and "obligations" in obligations_data:
        for idx, obs in enumerate(obligations_data["obligations"]):
            mapped_summary["obligations"].append({
                "id": f"o_{idx}",
                "text": f"{obs.get('responsible_party', 'Party')} must perform: {obs.get('description', '')}"
            })
            if obs.get("due_date"):
                mapped_summary["deadlines"].append({
                    "id": f"d_{idx}",
                    "title": f"{obs.get('obligation_type', 'Action')} Deadline",
                    "date": obs.get("due_date"),
                    "isCritical": obs.get("status") in ["Upcoming", "Ongoing"]
                })

    if summary and "key_points" in summary:
        for idx, pt in enumerate(summary["key_points"]):
            mapped_summary["financialCommitments"].append({
                "id": f"f_{idx}",
                "name": pt.get("label", ""),
                "value": pt.get("value", "")
            })

    if clauses_data and isinstance(clauses_data, dict) and "clauses" in clauses_data:
        for cl in clauses_data["clauses"]:
            if cl.get("category") == "Term & Renewal":
                mapped_summary["renewalTerms"].append(cl.get("summary", ""))
            elif cl.get("category") == "Termination":
                mapped_summary["terminationConditions"].append(cl.get("summary", ""))

    if risk_analysis and isinstance(risk_analysis, dict) and "items" in risk_analysis:
        for item in risk_analysis["items"]:
            mapped_summary["topRisks"].append(item.get("description", ""))
            mapped_summary["recommendedNextSteps"].append(item.get("recommendation", ""))

    mapped_comparisons = []
    if negotiation and isinstance(negotiation, dict) and "suggestions" in negotiation:
        for idx, sug in enumerate(negotiation["suggestions"]):
            mapped_comparisons.append({
                "id": f"comp_{idx}",
                "clauseName": sug.get("clause_name", "Clause"),
                "deviationType": "Major Deviation" if sug.get("priority") == "High" else "Minor Deviation",
                "approvedText": sug.get("suggested_wording", ""),
                "contractText": sug.get("current_wording", "")
            })

    mapped_version_comparisons = []
    if negotiation and isinstance(negotiation, dict) and "suggestions" in negotiation:
        for idx, sug in enumerate(negotiation["suggestions"]):
            mapped_version_comparisons.append({
                "id": f"vc_{idx}",
                "clauseName": sug.get("clause_name", "Clause"),
                "status": "Modified",
                "originalText": sug.get("suggested_wording", ""),
                "currentText": sug.get("current_wording", "")
            })

    mapped_compliance = []
    if compliance_data and isinstance(compliance_data, dict) and "frameworks" in compliance_data:
        for idx, fw in enumerate(compliance_data["frameworks"]):
            fw_name = fw.get("framework", "")
            status = "Pass" if fw.get("overall_status") == "Pass" else ("Fail" if fw.get("overall_status") == "Gap" else "Warning")
            mapped_compliance.append({
                "id": f"comp_rec_{idx}",
                "contractId": str(c.get("id")),
                "framework": fw_name,
                "status": status,
                "score": 95 if status == "Pass" else (45 if status == "Fail" else 70),
                "lastChecked": c.get("upload_time") or "",
                "issues": [item.get("finding", "") for item in fw.get("items", []) if item.get("status") != "Compliant"],
                "recommendations": [item.get("recommendation", "") for item in fw.get("items", []) if item.get("recommendation")]
            })

    overall_risk = "Low"
    risk_score = float(c.get("risk_score") or 0.0)
    if risk_score > 75:
        overall_risk = "Critical"
    elif risk_score > 50:
        overall_risk = "High"
    elif risk_score > 25:
        overall_risk = "Medium"

    effective_date = ""
    if entities_data and isinstance(entities_data, dict) and "entities" in entities_data:
        dates = [e["text"] for e in entities_data["entities"] if e.get("type") == "Date"]
        if dates:
            effective_date = dates[0]
    if not effective_date:
        effective_date = c.get("upload_time")[:10] if c.get("upload_time") else ""

    val_str = "$0"
    if entities_data and isinstance(entities_data, dict) and "entities" in entities_data:
        amounts = [e["text"] for e in entities_data["entities"] if e.get("type") == "Monetary Amount"]
        if amounts:
            val_str = amounts[0]

    return {
        "id": str(c.get("id")),
        "name": c.get("filename", ""),
        "counterparty": counterparty,
        "type": c.get("contract_type") or "Agreement",
        "effectiveDate": effective_date,
        "value": val_str,
        "overallRisk": overall_risk,
        "score": int(risk_score),
        "clausesCount": len(mapped_clauses),
        "status": c.get("workflow_status", "Under Review"),
        "clauses": mapped_clauses,
        "aiSummary": mapped_summary,
        "comparisons": mapped_comparisons,
        "versionComparisons": mapped_version_comparisons,
        "complianceRecords": mapped_compliance
    }


@app.get("/api/contracts")
def list_contracts(x_username: Optional[str] = Header(None)):
    """Retrieve list of all contract records for this user."""
    contracts = get_all_contracts(x_username)
    return [map_contract_to_frontend(c) for c in contracts]


@app.get("/api/contracts/{contract_id}")
def get_contract(contract_id: int, x_username: Optional[str] = Header(None)):
    """Retrieve full detail of a single contract record, verifying ownership."""
    c = get_contract_by_id(contract_id)
    if not c or (x_username and c.get("username") != x_username):
        raise HTTPException(status_code=404, detail="Contract record not found")
    return map_contract_to_frontend(c)


@app.delete("/api/contracts/{contract_id}")
def delete_contract_record(contract_id: int, x_username: Optional[str] = Header(None)):
    """Delete a contract history record, verifying ownership."""
    c = get_contract_by_id(contract_id)
    if not c or (x_username and c.get("username") != x_username):
        raise HTTPException(status_code=404, detail="Contract record not found")
        
    deleted = delete_contract(contract_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Contract record not found")
    clear_vector_store(contract_id)
    # Delete saved raw text file
    text_path = Path("contract_texts") / f"{contract_id}.txt"
    if text_path.exists():
        text_path.unlink()
    return {"status": "success", "message": f"Contract {contract_id} deleted."}


class ChatRequest(BaseModel):
    question: str


@app.post("/api/contracts/{contract_id}/chat")
def chat_contract(contract_id: int, req: ChatRequest):
    """Perform contextual RAG chat query against a contract's vector store."""
    vs = load_vector_store(contract_id)
    if not vs:
        raise HTTPException(status_code=404, detail="Contract vector store index not found")
    index, chunks = vs
    answer, sources = chat_with_contract(req.question, index, chunks)
    return {"answer": answer, "sources": sources}


class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3


@app.post("/api/contracts/{contract_id}/search")
def search_contract(contract_id: int, req: SearchRequest):
    """Run FAISS semantic search for relevant text chunks."""
    vs = load_vector_store(contract_id)
    if not vs:
        raise HTTPException(status_code=404, detail="Contract vector store index not found")
    index, chunks = vs
    results = search_similar_chunks(req.query, index, chunks, top_k=req.top_k)
    return results


class CompareRequest(BaseModel):
    contract_id_a: int
    contract_id_b: int


@app.post("/api/contracts/compare")
def compare_contracts_endpoint(req: CompareRequest):
    """Compare two uploaded contracts."""
    text_path_a = Path("contract_texts") / f"{req.contract_id_a}.txt"
    text_path_b = Path("contract_texts") / f"{req.contract_id_b}.txt"

    if not text_path_a.exists() or not text_path_b.exists():
        raise HTTPException(status_code=404, detail="One or both contract texts not found")

    with open(text_path_a, "r", encoding="utf-8") as f:
        text_a = f.read()
    with open(text_path_b, "r", encoding="utf-8") as f:
        text_b = f.read()

    result = compare_contracts(text_a, text_b)
    # Return as parsed Pydantic object
    return result


@app.get("/api/clauses/library")
def get_clause_library(search: Optional[str] = None, type: Optional[str] = None):
    """Get all saved clauses in library, optionally filtering by search/type."""
    clauses = get_all_clauses()
    if type:
        clauses = [c for c in clauses if type.lower() in c.get("clause_type", "").lower()]
    if search:
        clauses = [c for c in clauses if search.lower() in c.get("clause_text", "").lower() or search.lower() in c.get("clause_type", "").lower()]
    return clauses


class ClauseSaveRequest(BaseModel):
    clause_type: str
    clause_text: str
    source_contract: Optional[str] = None


@app.post("/api/clauses/library")
def save_library_clause(req: ClauseSaveRequest):
    """Save a clause manually to the library database."""
    record = save_clause_to_db(req.clause_type, req.clause_text, req.source_contract)
    return record.to_dict()


@app.delete("/api/clauses/library/{clause_id}")
def delete_library_clause(clause_id: int):
    """Delete a clause from the library."""
    deleted = delete_clause_from_db(clause_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Clause not found")
    return {"status": "success"}


@app.get("/api/dashboard/stats")
def dashboard_stats(x_username: Optional[str] = Header(None)):
    """Retrieve full combined dashboard analytics and summary stats for this user."""
    return {
        "stats": get_dashboard_stats(x_username),
        "risk_distribution": get_risk_distribution(x_username),
        "clause_frequency": get_clause_frequency(),
        "summary_table": get_contracts_summary_table(x_username),
    }


@app.get("/api/contracts/{contract_id}/pdf")
def get_contract_pdf(contract_id: int, x_username: Optional[str] = Header(None)):
    """Generate and stream PDF report of a contract analysis, verifying ownership."""
    c = get_contract_by_id(contract_id)
    if not c or (x_username and c.get("username") != x_username):
        raise HTTPException(status_code=404, detail="Contract not found")

    pdf_bytes = generate_pdf_report(
        filename=c["filename"],
        summary=c.get("summary"),
        clauses=c.get("clauses"),
        risk_analysis=c.get("risk_analysis"),
        risk_score=int(c["risk_score"]) if c.get("risk_score") is not None else None,
        contract_type=c.get("contract_type"),
        obligations=c.get("obligations"),
        entities=c.get("entities"),
        red_flags=c.get("red_flags"),
        compliance=c.get("compliance"),
        negotiations=c.get("negotiation_suggestions"),
    )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Analysis_Report_{contract_id}.pdf"},
    )


class StatusUpdateRequest(BaseModel):
    status: str


@app.patch("/api/contracts/{contract_id}/status")
def update_contract_status_endpoint(contract_id: int, req: StatusUpdateRequest, x_username: Optional[str] = Header(None)):
    """Update contract negotiation/review status, verifying ownership."""
    c = get_contract_by_id(contract_id)
    if not c or (x_username and c.get("username") != x_username):
        raise HTTPException(status_code=404, detail="Contract not found")

    session = _get_session()
    try:
        record = session.query(ContractRecord).filter_by(id=contract_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Contract not found")
        record.workflow_status = req.status
        session.commit()
        return {"status": "success", "workflow_status": record.workflow_status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


@app.get("/api/contracts/{contract_id}/docx")
def get_contract_docx(contract_id: int, x_username: Optional[str] = Header(None)):
    """Generate and stream Word DOCX report of a contract analysis, verifying ownership."""
    from services.docx_exporter import generate_docx_report
    c = get_contract_by_id(contract_id)
    if not c or (x_username and c.get("username") != x_username):
        raise HTTPException(status_code=404, detail="Contract not found")

    docx_bytes = generate_docx_report(
        filename=c["filename"],
        summary=c.get("summary"),
        clauses=c.get("clauses"),
        risk_analysis=c.get("risk_analysis"),
        risk_score=int(c["risk_score"]) if c.get("risk_score") is not None else None,
        contract_type=c.get("contract_type"),
        obligations=c.get("obligations"),
        entities=c.get("entities"),
        red_flags=c.get("red_flags"),
        compliance=c.get("compliance"),
        negotiations=c.get("negotiation_suggestions"),
    )

    return StreamingResponse(
        BytesIO(docx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f"attachment; filename=Redlines_Report_{contract_id}.docx"},
    )


class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str
    name: str
    initials: str
    email: str


@app.post("/api/auth/register")
def register_user_endpoint(req: RegisterRequest):
    """Register a new user in the database."""
    session = _get_session()
    try:
        existing_user = session.query(UserRecord).filter_by(username=req.username).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        user = create_user(
            username=req.username,
            password=req.password,
            role=req.role,
            name=req.name,
            initials=req.initials,
            email=req.email,
        )
        return user.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        session.close()


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/auth/login")
def login_user_endpoint(req: LoginRequest):
    """Authenticate and login a user, returning their profile details."""
    user = authenticate_user(req.username, req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return user.to_dict()
from io import BytesIO
