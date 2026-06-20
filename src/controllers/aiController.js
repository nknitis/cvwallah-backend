import { generateJson, generateText } from "../services/geminiService.js";
import { isValidCvData } from "../utils/validateCvData.js";

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

    res.json(updatedCvData);
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
