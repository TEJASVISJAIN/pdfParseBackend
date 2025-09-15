import express from "express";
import pdfController from "../controllers/pdfController.js";
import multer from "multer";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), pdfController.pdfFunction);

export default router;
