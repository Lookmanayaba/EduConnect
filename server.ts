import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for mock analysis when Gemini API is not available or fails
function getMockAnalysis(studentName: string, grades: any[], behavior: string) {
  const average = grades.length > 0 ? grades.reduce((acc, g) => acc + g.value, 0) / grades.length : 12;
  
  const difficultyDetected = average < 10;
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let teacherComment = "";

  if (average < 10) {
    warnings.push("Moyenne générale en dessous de la moyenne de passage (10/20).");
    suggestions.push("Mettre en place des séances hebdomadaires de soutien scolaire ciblé.");
    suggestions.push("Travailler des fiches de révision de cours condensées.");
    suggestions.push("Organiser une rencontre parent-enseignant pour ajuster l'accompagnement.");
    teacherComment = `Résultats insuffisants ce trimestre. ${studentName} rencontre des difficultés d'assimilation. Un travail régulier et un soutien renforcé à la maison sont indispensables pour redresser la barre.`;
  } else if (average < 14) {
    if (average < 12) {
      warnings.push("Attention, la moyenne s'approche du seuil d'alerte dans certaines matières.");
    }
    suggestions.push("Encourager l'élève à poser plus de questions lors des cours.");
    suggestions.push("Établir un planning d'étude quotidien à la maison.");
    suggestions.push("S'exercer sur des fonctionnalités interactives et fiches de devoirs pour s'auto-évaluer.");
    teacherComment = `Un trimestre convenable mais linéaire. ${studentName} travaille avec sérieux mais s'implique peu en classe. En accentuant sa participation orale, les résultats progresseront.`;
  } else {
    suggestions.push("Proposer des travaux d'approfondissement d'analyse pour alimenter sa curiosité.");
    suggestions.push("Devenir tuteur d'autres élèves pour consolider les notions acquises.");
    suggestions.push("Participer aux devoirs de niveau supérieur pour préparer l'année prochaine.");
    teacherComment = `Excellent bilan trimestriel ! Des résultats brillants découlant d'une grande rigueur de travail et d'un comportement irréprochable. Félicitations à ${studentName} !`;
  }

  if (behavior.toLowerCase().includes("bavard") || behavior.toLowerCase().includes("bavardage") || behavior.toLowerCase().includes("distrait")) {
    warnings.push("Bavardages récurrents signalés, nuisant d'abord à sa propre concentration.");
    suggestions.push("Se placer au premier rang de la classe pour limiter les distractions.");
  }

  return {
    summary: `L'analyse automatique des performances de ${studentName} met en évidence une moyenne générale de ${average.toFixed(1)}/20. L'élève montre un profil ${average >= 14 ? 'vigoureux et épanoui' : average >= 10 ? 'méritant mais perfectible' : 'très fragile nécessitant une remédiation urgente'}.`,
    difficultyDetected,
    warnings,
    suggestions,
    teacherComment
  };
}

// API endpoint for AI analysis
app.post("/api/ai/analyse", async (req, res) => {
  try {
    const { studentName, classLevel, grades, attendance, behavior } = req.body;
    
    if (!studentName || !grades) {
      return res.status(400).json({ error: "Champs obligatoires manquants (studentName, grades)" });
    }

    const key = process.env.GEMINI_API_KEY;
    if (!key || key.includes("MY_GEMINI_API_KEY") || key.trim() === "") {
      console.log("No GEMINI_API_KEY configured. Falling back to local mock analyzer.");
      const mockResult = getMockAnalysis(studentName, grades, behavior || "Correct");
      return res.json({ ...mockResult, source: "mocked" });
    }

    const ai = new GoogleGenAI({ apiKey: key });
    
    const prompt = `Analyser la performance de l'élève suivant :
Nom: ${studentName}
Classe: ${classLevel || "Non spécifiée"}
Notes: ${JSON.stringify(grades)}
Présence: ${JSON.stringify(attendance || {})}
Comportement: ${behavior || "Correct"}

Générer un rapport de diagnostic scolaire structuré au format JSON contenant les clés suivantes STRICTEMENT :
- summary: Un court résumé de son bilan de compétences (2-3 phrases en français).
- difficultyDetected: un booléen indiquant si l'élève est en situation de décrochage ou de difficultés notables (moyenne générale inférieure à 10, ou alertes de présence graves).
- warnings: Un tableau de signaux d'alertes pédagogiques ou comportementales détectées (sinon tableau vide).
- suggestions: Un tableau de 3 suggestions pédagogiques personnalisées en français (ex: fiches de soutien, coaching, etc.).
- teacherComment: Un commentaire formel, professionnel et bienveillant destiné au bulletin officiel d'environ 30 mots, rédigé en français.

La réponse DOIT être exclusivement du JSON valide, sans formatage markdown de bloc de code (pas de \`\`\`json etc.).`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Gemini API call failed, backing up to local analyzer:", error);
    try {
      const studentName = req.body.studentName || "Élève";
      const grades = req.body.grades || [];
      const behavior = req.body.behavior || "Correct";
      const fallbackResult = getMockAnalysis(studentName, grades, behavior);
      res.json({ ...fallbackResult, source: "fallback-mock", error: error.message });
    } catch (innerError: any) {
      res.status(500).json({ error: "Erreur lors de l'analyse automatique." });
    }
  }
});

// Vite middleware configuration for serving the frontend
async function startServer() {
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EduConnect server is running on http://localhost:${PORT}`);
  });
}

startServer();
