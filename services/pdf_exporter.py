"""
PDF export service.

Generates downloadable PDF reports from contract analysis results.
Uses fpdf2 for lightweight, pure-Python PDF generation.
"""

import json
from io import BytesIO
from datetime import datetime

from fpdf import FPDF


def sanitize_text(text: str) -> str:
    """Sanitize text to be compatible with Helvetica/Latin-1 encoding in FPDF.

    Replaces smart quotes, dashes, and other common unicode characters with their
    standard Latin-1/ASCII equivalents, and handles any remaining unsupported characters.
    """
    if not text:
        return ""
    replacements = {
        "\u201c": '"',  # Left double quotation mark
        "\u201d": '"',  # Right double quotation mark
        "\u2018": "'",  # Left single quotation mark
        "\u2019": "'",  # Right single quotation mark
        "\u2013": "-",  # En dash
        "\u2014": "-",  # Em dash
        "\u2022": "*",  # Bullet point
        "\u2026": "...",  # Horizontal ellipsis
        "\u00a0": " ",  # Non-breaking space
    }
    for orig, rep in replacements.items():
        text = text.replace(orig, rep)
    
    # Fallback to Latin-1 encoding, replacing unknown chars
    return text.encode("latin-1", errors="replace").decode("latin-1")



class ContractReportPDF(FPDF):
    """Custom PDF class for contract analysis reports."""

    def __init__(self) -> None:
        super().__init__()
        self.set_auto_page_break(auto=True, margin=20)

    def header(self) -> None:
        """Render page header with branding."""
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 58, 95)
        self.cell(100, 8, "Contract Intelligence Platform", align="L")
        self.set_font("Helvetica", "", 8)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, datetime.now().strftime("%Y-%m-%d %H:%M"), align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(30, 58, 95)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(5)

    def footer(self) -> None:
        """Render page footer with page number."""
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}}", align="C")

    def add_title(self, title: str) -> None:
        """Add a title section."""
        title = sanitize_text(title)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(30, 58, 95)
        self.cell(0, 12, title, new_x="LMARGIN", new_y="NEXT")
        self.ln(4)

    def add_section_header(self, header: str) -> None:
        """Add a section header."""
        header = sanitize_text(header)
        self.ln(4)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(30, 41, 59)
        self.cell(0, 10, header, new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(226, 232, 240)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(3)

    def add_body_text(self, text: str) -> None:
        """Add formatted body text to the PDF."""
        clean_text = sanitize_text(text)
        self.set_font("Helvetica", "", 10)
        self.set_text_color(30, 41, 59)

        for line in clean_text.split("\n"):
            stripped = line.strip()
            if not stripped:
                self.ln(3)
                continue

            if stripped.startswith("| ") and stripped.endswith(" |"):
                # Table row — render as monospaced
                self.set_font("Courier", "", 8)
                self.multi_cell(0, 5, stripped, new_x="LMARGIN", new_y="NEXT")
                self.set_font("Helvetica", "", 10)
            elif stripped.startswith("- ") or stripped.startswith("* "):
                # Bullet point
                self.multi_cell(0, 6, f"-  {stripped[2:]}", new_x="LMARGIN", new_y="NEXT")
            else:
                self.multi_cell(0, 6, stripped, new_x="LMARGIN", new_y="NEXT")

    def add_risk_score(self, score: int, level: str) -> None:
        """Add a visual risk score section.

        Args:
            score: The risk score (0-100).
            level: The risk level label.
        """
        self.ln(3)

        # Color based on level
        colors = {
            "Low": (61, 107, 79),      # --ok
            "Medium": (184, 134, 46),   # --warn
            "High": (162, 59, 59),     # --danger
            "Critical": (156, 122, 60), # --accent
        }
        r, g, b = colors.get(level, (100, 116, 139))

        self.set_font("Helvetica", "B", 24)
        self.set_text_color(r, g, b)
        self.cell(40, 15, f"{score}/100")
        self.set_font("Helvetica", "B", 14)
        self.cell(0, 15, sanitize_text(f"  {level} Risk"), new_x="LMARGIN", new_y="NEXT")
        self.ln(3)


def _format_json_field(field_name: str, content: str) -> str:
    """Format structured JSON content into a readable text block.

    Args:
        field_name: The name of the field (e.g. summary, clauses).
        content: The JSON-encoded string.

    Returns:
        A readable text string.
    """
    if not content:
        return ""
    try:
        data = json.loads(content)
    except Exception:
        return content  # Fallback to raw string if not JSON

    lines = []
    if field_name == "summary":
        if "narrative" in data:
            lines.append(f"Narrative Summary:\n{data['narrative']}\n")
        if "key_points" in data:
            lines.append("Key Points:")
            for kp in data["key_points"]:
                lines.append(f"- {kp.get('label')}: {kp.get('value')}")

    elif field_name == "clauses":
        clauses_list = data.get("clauses", [])
        for c in clauses_list:
            ref = f" [{c.get('reference')}]" if c.get("reference") else ""
            lines.append(f"- Type: {c.get('clause_type')}{ref} ({c.get('category')})")
            lines.append(f"  Summary: {c.get('summary')}")
            lines.append(f"  Text: \"{c.get('extracted_text')}\"\n")

    elif field_name == "risk_analysis":
        if "overall_summary" in data:
            lines.append(f"Overall Assessment:\n{data['overall_summary']}\n")
        items = data.get("items", [])
        if items:
            lines.append("Identified Risks:")
            for item in items:
                lines.append(f"- [{item.get('severity')}] {item.get('category')}: {item.get('description')}")
                lines.append(f"  Recommendation: {item.get('recommendation')}\n")

    elif field_name == "obligations":
        if "critical_summary" in data:
            lines.append(f"Critical Obligations Summary:\n{data['critical_summary']}\n")
        obligations = data.get("obligations", [])
        if obligations:
            lines.append("Tracked Obligations:")
            for ob in obligations:
                due = f" (Due: {ob.get('due_date')})" if ob.get("due_date") else ""
                lines.append(f"- {ob.get('obligation_type')}: {ob.get('description')}{due}")
                lines.append(f"  Party: {ob.get('responsible_party')} | Status: {ob.get('status')}\n")

    elif field_name == "entities":
        entities = data.get("entities", [])
        if entities:
            lines.append("Extracted Entities:")
            for ent in entities:
                lines.append(f"- {ent.get('text')} ({ent.get('type')})")
                lines.append(f"  Context: {ent.get('context')}\n")

    elif field_name == "red_flags":
        flags = data.get("flags", [])
        if flags:
            lines.append("Detected Red Flags:")
            for flag in flags:
                lines.append(f"- [{flag.get('severity')}] {flag.get('title')} ({flag.get('location')})")
                lines.append(f"  Description: {flag.get('description')}")
                lines.append(f"  Recommendation: {flag.get('recommendation')}\n")

    elif field_name == "compliance":
        frameworks = data.get("frameworks", [])
        for fw in frameworks:
            lines.append(f"- Framework: {fw.get('framework')} (Status: {fw.get('overall_status')}, Applicable: {fw.get('applicable')})")
            for item in fw.get("items", []):
                lines.append(f"  * {item.get('requirement')}: {item.get('status')}")
                lines.append(f"    Finding: {item.get('finding')}")
                if item.get("recommendation"):
                    lines.append(f"    Rec: {item.get('recommendation')}")
            lines.append("")

    elif field_name == "negotiation_suggestions":
        if "strategy_summary" in data:
            lines.append(f"Negotiation Strategy:\n{data['strategy_summary']}\n")
        suggestions = data.get("suggestions", [])
        if suggestions:
            lines.append("Specific Wording Suggestions:")
            for s in suggestions:
                ref = f" ({s.get('reference')})" if s.get('reference') else ""
                lines.append(f"- Clause: {s.get('clause_name')}{ref} [Priority: {s.get('priority')}, Negotiability: {s.get('negotiability')}]")
                lines.append(f"  Current Wording: {s.get('current_wording')}")
                lines.append(f"  Suggested Wording: {s.get('suggested_wording')}")
                lines.append(f"  Rationale: {s.get('rationale')}\n")

    else:
        return str(data)

    return "\n".join(lines)


def generate_pdf_report(
    filename: str,
    summary: str | None = None,
    clauses: str | None = None,
    risk_analysis: str | None = None,
    risk_score: int | None = None,
    contract_type: str | None = None,
    obligations: str | None = None,
    entities: str | None = None,
    red_flags: str | None = None,
    compliance: str | None = None,
    negotiations: str | None = None,
) -> bytes:
    """Generate a PDF report from contract analysis results.

    Args:
        filename: The contract filename.
        summary: Contract summary (Markdown or JSON).
        clauses: Extracted clauses (Markdown or JSON).
        risk_analysis: Risk analysis (Markdown or JSON).
        risk_score: Risk score (0-100).
        contract_type: Classified contract type.
        obligations: Obligations (Markdown or JSON).
        entities: NER results (Markdown or JSON).
        red_flags: Red flag detection results (Markdown or JSON).
        compliance: Compliance check results (Markdown or JSON).
        negotiations: Negotiation suggestions (Markdown or JSON).

    Returns:
        PDF file content as bytes.
    """
    pdf = ContractReportPDF()
    pdf.alias_nb_pages()
    pdf.add_page()

    # Title
    pdf.add_title(f"Analysis Report: {filename}")

    # Contract type badge
    if contract_type:
        pdf.set_font("Helvetica", "I", 11)
        pdf.set_text_color(100, 116, 139)
        pdf.cell(0, 8, sanitize_text(f"Contract Type: {contract_type}"), new_x="LMARGIN", new_y="NEXT")
        pdf.ln(2)

    # Risk Score
    if risk_score is not None:
        from services.risk_analyzer import get_risk_level
        level = get_risk_level(risk_score)
        pdf.add_section_header("Risk Score")
        pdf.add_risk_score(risk_score, level)

    # Summary
    if summary:
        pdf.add_section_header("Contract Summary")
        pdf.add_body_text(_format_json_field("summary", summary))

    # Clauses
    if clauses:
        pdf.add_page()
        pdf.add_section_header("Extracted Clauses")
        pdf.add_body_text(_format_json_field("clauses", clauses))

    # Risk Analysis
    if risk_analysis:
        pdf.add_page()
        pdf.add_section_header("Risk Analysis")
        pdf.add_body_text(_format_json_field("risk_analysis", risk_analysis))

    # Obligations
    if obligations:
        pdf.add_page()
        pdf.add_section_header("Obligations & Deadlines")
        pdf.add_body_text(_format_json_field("obligations", obligations))

    # Named Entities
    if entities:
        pdf.add_page()
        pdf.add_section_header("Named Entities")
        pdf.add_body_text(_format_json_field("entities", entities))

    # Red Flags
    if red_flags:
        pdf.add_page()
        pdf.add_section_header("Red Flag Detection")
        pdf.add_body_text(_format_json_field("red_flags", red_flags))

    # Compliance
    if compliance:
        pdf.add_page()
        pdf.add_section_header("Compliance Check")
        pdf.add_body_text(_format_json_field("compliance", compliance))

    # Negotiation Suggestions
    if negotiations:
        pdf.add_page()
        pdf.add_section_header("Negotiation Suggestions")
        pdf.add_body_text(_format_json_field("negotiation_suggestions", negotiations))

    # Generate bytes
    return pdf.output()
