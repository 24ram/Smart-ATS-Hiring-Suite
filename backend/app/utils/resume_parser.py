import fitz
from docx import Document
from io import BytesIO


def parse_pdf(file_content: bytes) -> str:
    text = ""

    pdf = fitz.open(stream=file_content, filetype="pdf")

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text


def parse_docx(file_content: bytes) -> str:
    text = ""

    doc = Document(BytesIO(file_content))

    for para in doc.paragraphs:
        text += para.text + "\n"

    return text


def parse_resume(file_content: bytes, filename: str) -> str:
    filename = filename.lower()

    if filename.endswith(".pdf"):
        return parse_pdf(file_content)

    if filename.endswith(".docx"):
        return parse_docx(file_content)

    return ""