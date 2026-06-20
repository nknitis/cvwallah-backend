import express from "express";
import {
  checkAtsScore,
  roastCv,
  tailorCv
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/ats-score", checkAtsScore);
router.post("/tailor-cv", tailorCv);
router.post("/roast-cv", roastCv);

export default router;
