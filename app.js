import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
import pdfRoute from "./routes/pdfRoute.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

if (!process.env.GROQ_API_KEY) {
  console.warn("Warning: GROQ_API_KEY is not set. PDF analysis will fail until configured.");
}

app.get("/", (req, res) => {
  res.json({ message: "Hello from backend!" });
});

app.use("/pdf", pdfRoute);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something broke!" });
});
app.listen(PORT, () => {
  console.log("app running on port", PORT);
});
