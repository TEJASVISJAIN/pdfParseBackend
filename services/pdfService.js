import pdf from "pdf-parse/lib/pdf-parse.js";
import aiService, { analyzeResumeText } from "./aiService.js";

const extractPdfText = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("No file buffer provided");
  }
  const result = await pdf(file.buffer);
  return result.text || "";
};

const buildHeuristicHints = (text) => {
  const cleaned = text.replace(/\r/g, "");
  const lines = cleaned.split(/\n+/).map(l => l.trim()).filter(Boolean);

  let full_name = null;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (/^curriculum vitae|resume|cv$/i.test(line)) continue;
    const nameMatch = line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}$/);
    if (nameMatch) { full_name = nameMatch[0]; break; }
  }

  const collegeMatch = cleaned.match(/\b(University|College|Institute of Technology|Institute)\b[^\n]{0,80}/i);
  const college = collegeMatch ? collegeMatch[0].trim() : null;

  let most_recent_company = null;
  const expIdx = cleaned.search(/\bExperience\b|\bProfessional Experience\b/i);
  const searchArea = expIdx >= 0 ? cleaned.slice(expIdx, expIdx + 2000) : cleaned.slice(0, 2000);
  const companyMatch = searchArea.match(/\b([A-Z][A-Za-z&\-]+(?:\s+[A-Z][A-Za-z&\-]+){0,3})\b\s*(?:\(|\-|,)?\s*(?:[A-Z][a-z]+\s\d{4}|Present|Current)?/);
  if (companyMatch) most_recent_company = companyMatch[1];

  let top_skills = [];
  const skillsSectionMatch = cleaned.match(/\bSkills\b[\s\S]{0,600}/i);
  if (skillsSectionMatch) {
    const afterSkills = skillsSectionMatch[0].replace(/\bSkills\b[:\-]?/i, "");
    top_skills = afterSkills.split(/[,\u2022\n]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40).slice(0, 15);
  }

  return { full_name, college, most_recent_company, top_skills };
};

const pdfMetaData = async (inputPayload) => {
  const fileName = inputPayload?.originalname || null;
  const fileSize = inputPayload?.size || null;
  const mimeType = inputPayload?.mimetype || null;

  const text = await extractPdfText(inputPayload);
  const hints = buildHeuristicHints(text);
  const ai = await analyzeResumeText(text.slice(0, 16000), hints);

  const fields = {
    full_name: ai.full_name || hints.full_name || null,
    college: ai.college || hints.college || null,
    most_recent_company: ai.most_recent_company || hints.most_recent_company || null,
    top_skills: (ai.top_skills && ai.top_skills.length ? ai.top_skills : hints.top_skills) || [],
  };

  return { fileName, fileSize, mimeType, fields };
};

const pdfService = { pdfMetaData };

export default pdfService;
