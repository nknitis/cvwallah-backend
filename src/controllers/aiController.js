import { generateJson, generateText } from "../services/geminiService.js";
import { extractLinksFromText, uniqueLinks } from "../utils/extractLinks.js";
import { isValidCvData, mergeCvDataWithFallback } from "../utils/validateCvData.js";

export const checkAtsScore = async (req, res, next) => {
  try {
    const { cvData } = req.body;

    if (!isValidCvData(cvData)) {
      return res.status(400).json({ message: "Invalid or missing CV data." });
    }

    const prompt = `
Analyze this CV JSON data against industry standards. Rate it out of 100 for ATS friendliness.
Return ONLY a valid JSON response with keys: "score" (number) and "suggestions" (array of strings).
Do not include markdown formatting or backticks.

CV JSON:
${JSON.stringify(cvData, null, 2)}
`;

    const result = await generateJson(prompt);

    res.json({
      score: Number(result.score) || 0,
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : []
    });
  } catch (err) {
    next(err);
  }
};

export const tailorCv = async (req, res, next) => {
  try {
    const { cvData, jobDescription } = req.body;

    if (!isValidCvData(cvData)) {
      return res.status(400).json({ message: "Invalid or missing CV data." });
    }

    if (!jobDescription || typeof jobDescription !== "string") {
      return res.status(400).json({ message: "Job description is required." });
    }

    const prompt = `
Act as an expert recruiter. Compare this CV JSON with this Job Description.
Rewrite the experience descriptions and rearrange skills to perfectly match the keywords of the job description without fabricating fake data.
Return ONLY the updated CV data in the exact same JSON structure provided.

Current CV JSON:
${JSON.stringify(cvData, null, 2)}

Target Job Description:
${jobDescription}
`;

    const updatedCvData = await generateJson(prompt);

    if (!isValidCvData(updatedCvData)) {
      return res.status(502).json({
        message: "AI returned an invalid CV structure. Please try again."
      });
    }

    const safeCvData = mergeCvDataWithFallback(cvData, updatedCvData);
    res.json(safeCvData);
  } catch (err) {
    next(err);
  }
};

export const importResume = async (req, res, next) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText || typeof resumeText !== "string" || !resumeText.trim()) {
      return res.status(400).json({ message: "Resume text is required." });
    }

    const prompt = `
Act as an expert resume parser for a CV builder app.
Extract the resume text into this exact JSON structure:
{
  "personal": { "name": "", "email": "", "phone": "", "linkedin": "", "github": "" },
  "education": [{ "degree": "", "school": "", "year": "", "grades": "" }],
  "experience": [{ "role": "", "company": "", "duration": "", "description": "" }],
  "skills": [],
  "projects": [{ "title": "", "description": "", "techStack": [], "link": "" }],
  "customSections": [{ "title": "", "content": "" }]
}

Rules:
- Return ONLY valid JSON. No markdown, no backticks, no explanation.
- Do not guess or fabricate missing details.
- Keep fields empty if the text does not clearly provide them.
- Put certifications, achievements, languages, interests, awards, and profiles that do not fit elsewhere into customSections.
- Split skills into clean individual strings.
- Keep experience descriptions concise and preserve real facts from the resume text.

Resume text:
${resumeText}
`;

    const parsedCvData = await generateJson(prompt);

    if (!isValidCvData(parsedCvData)) {
      return res.status(502).json({
        message: "AI could not extract a clean CV structure. Try pasting clearer resume text."
      });
    }

    res.json(parsedCvData);
  } catch (err) {
    next(err);
  }
};

export const extractPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "PDF file is required." });
    }

    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText({ first: 3 });
    await parser.destroy();
    const text = result.text.trim();

    if (!text) {
      return res.status(422).json({
        message:
          "No selectable text found in this PDF. Try a text-based PDF or paste the resume text manually."
      });
    }

    res.json({
      text,
      links: uniqueLinks(extractLinksFromText(text)),
      pagesRead: Math.min(result.total || 0, 3),
      totalPages: result.total || 0
    });
  } catch (err) {
    next(err);
  }
};

export const roastCv = async (req, res, next) => {
  try {
    const { cvData } = req.body;

    if (!isValidCvData(cvData)) {
      return res.status(400).json({ message: "Invalid or missing CV data." });
    }

    const prompt = `
Act as a highly toxic, sarcastic, and savage tech recruiter. Look at this candidate's CV JSON data.
Brutally roast their generic skills, simple projects (like weather apps/to-do lists), or employment gaps.
Use a hilarious mix of English and casual Hinglish.
Return 4-5 brutal bullet points as a plain text string.

CV JSON:
${JSON.stringify(cvData, null, 2)}
`;

    const roast = await generateText(prompt);

    res.json({ roast });
  } catch (err) {
    next(err);
  }
};
