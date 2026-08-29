import express from "express";
import multer from "multer";
import {
  checkAtsScore,
  extractPdf,
  importResume,
  roastCv,
  tailorCv
} from "../controllers/aiController.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter(req, file, callback) {
    if (file.mimetype !== "application/pdf") {
      return callback(new Error("Only PDF files are supported."));
    }

    return callback(null, true);
  }
});

router.post("/ats-score", checkAtsScore);
router.post("/tailor-cv", tailorCv);
router.post("/import-resume", importResume);
router.post("/extract-pdf", upload.single("resume"), extractPdf);
router.post("/roast-cv", roastCv);

export default router;
