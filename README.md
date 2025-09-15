## PDF Resume Parser API (Groq)

Minimal Node.js API to extract resume fields from uploaded PDFs using Groq + lightweight heuristics.

### Features
- Upload a PDF and extract: `full_name`, `college`, `most_recent_company`, `top_skills`
- Heuristic hints + Groq model for robust extraction
- Configurable model via env (`GROQ_MODEL`)

### Prerequisites
- Node.js 18+
- Groq API key

### Setup
1) Install deps
```
npm install
```
2) Environment
Create `.env` in project root:
```
GROQ_API_KEY=your_key_here
PORT=3000
# optional – override default model
# GROQ_MODEL=llama-3.1-8b-instant
```

### Run
```
npm start
```
Server: `http://localhost:3000`

### API
- POST `/pdf/upload`
  - Content-Type: `multipart/form-data`
  - Field: `file` (PDF)

Curl example:
```
curl -X POST http://localhost:3000/pdf/upload \
  -F "file=@/path/to/resume.pdf"
```

Response:
```
{
  "success": true,
  "data": {
    "fileName": "resume.pdf",
    "fileSize": 12345,
    "mimeType": "application/pdf",
    "fields": {
      "full_name": "John Doe",
      "college": "ABC University",
      "most_recent_company": "XYZ Corp",
      "top_skills": ["JavaScript", "Node.js", "React"]
    }
  }
}
```

### Configuration
- `GROQ_API_KEY` (required)
- `GROQ_MODEL` (optional; defaults to `llama-3.1-8b-instant`)

### Notes
- If your PDF is a scan (image‑only), add OCR (e.g., `tesseract.js`) for best results.
- Main logic lives in `services/aiService.js` (Groq) and `services/pdfService.js` (PDF text + heuristics).

### Project Scripts
```
npm start       # dev with nodemon
```

### License
MIT


