import { GoogleGenerativeAI } from "@google/generative-ai";
import Document from "../models/Document.js";
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzePitchDeck = async (req, res) => {
  const { id } = req.params;

  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.fileType !== 'application/pdf') {
      return res.status(400).json({ message: "Only PDF documents can be analyzed at this time." });
    }

    // Read PDF file
    const absolutePath = path.join(process.cwd(), document.filePath.startsWith('/') ? document.filePath.substring(1) : document.filePath);
    const dataBuffer = fs.readFileSync(absolutePath);
    const pdfData = await pdf(dataBuffer);
    const textContent = pdfData.text;

    if (!textContent || textContent.trim().length < 50) {
      return res.status(400).json({ message: "Could not extract enough text from the document for analysis." });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert venture capital analyst. Analyze the following pitch deck text and provide a structured JSON response.
      The response must strictly follow this JSON format:
      {
        "swot": {
          "strengths": ["string"],
          "weaknesses": ["string"],
          "opportunities": ["string"],
          "threats": ["string"]
        },
        "scores": {
          "market": number (1-10),
          "product": number (1-10),
          "team": number (1-10),
          "overall": number (1-10)
        },
        "summary": "short elevator pitch summary (max 3 sentences)"
      }

      Pitch Deck Text:
      ${textContent.substring(0, 10000)} // Limit text to avoid token limits
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting from Gemini
    text = text.replace(/```json|```/g, "").trim();
    
    const analysis = JSON.parse(text);

    // Save analysis to document
    document.aiAnalysis = {
      ...analysis,
      analyzedAt: new Date()
    };
    await document.save();

    res.json({
      message: "Analysis complete",
      analysis: document.aiAnalysis
    });

  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ message: "AI Analysis failed", error: error.message });
  }
};
