import fitz
import os

ROOT = os.path.dirname(os.path.dirname(__file__))
input_path = os.path.join(ROOT, "docs", "best.pdf")
output_path = os.path.join(ROOT, "docs", "best.cleaned.pdf")

if not os.path.exists(input_path):
    print(f"Input PDF not found: {input_path}")
    raise SystemExit(1)

# Substrings to look for in text blocks
patterns = [
    "4/22/26, 10:06 AM Student Academic Record Management System - Database-Focused Report",
    "Student Academic Record Management System - Database-Focused Report",
    "file:///home/chaldev/Code-room/code-collection/Student_management/student-result-system/docs/student-result-system-project-repor",
    "11/20",
    "12/20",
    "13/20",
    "14/20",
    "15/20",
    "16/20",
    "17/20",
    "18/20",
    "19/20",
    "20/20",
]

doc = fitz.open(input_path)
redacted_any = False
for page in doc:
    blocks = page.get_text("blocks")  # list of (x0, y0, x1, y1, text, block_no)
    page_redacted = False
    for b in blocks:
        bbox = fitz.Rect(b[:4])
        text = b[4]
        for p in patterns:
            if p in text:
                page.add_redact_annot(bbox, fill=(1, 1, 1))
                page_redacted = True
                redacted_any = True
                break
    if page_redacted:
        page.apply_redactions()

if redacted_any:
    doc.save(output_path)
    print(f"Saved cleaned PDF: {output_path}")
else:
    print("No matching text found; no changes made.")
    # still copy to output for user's convenience
    doc.save(output_path)
    print(f"Saved copy without modifications: {output_path}")

doc.close()
