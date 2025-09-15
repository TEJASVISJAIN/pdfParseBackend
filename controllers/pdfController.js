import pdfService from "../services/pdfService.js";

const pdfFunction = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded. Expect 'file' field." });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ success: false, message: "Only PDF files are supported." });
    }

    const inputPayload = req.file;
    const response = await pdfService.pdfMetaData(inputPayload);
    return res.status(200).json({ success: true, data: response });
  } catch (err) {
    return next(err);
  }
};

const pdfController = {
  pdfFunction,
};

export default pdfController;
