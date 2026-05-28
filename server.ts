import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON body parser
  app.use(express.json());

  // API routes
  app.post("/api/generate-notice", async (req, res) => {
    try {
      const { keywords } = req.body;
      if (!keywords || typeof keywords !== "string" || !keywords.trim()) {
        return res.status(400).json({ error: "키워드를 입력해 주세요." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "서버에 GEMINI_API_KEY 설정이 비어 있습니다. Settings > Secrets를 확인해 주세요." 
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `초등학교 교사 수얌쌤의 다정하고 친근한 어조로, 다음 핵심 키워드를 모두 사용하여 오늘의 학급 알림장 내용을 알기 쉽고 예쁘게 작성해 주십시오.
예시: "내일은 현장체험학습일입니다! 편한 옷을 입고 물과 도시락을 꼭 챙겨오세요."
초등학생 어린이들과 학부모님들이 읽기에 어울리는 따뜻하고 명확한 예쁜 어조로 작성해 주세요.
불필요한 인사말, 설명글 또는 따옴표(\", \') 등을 포함하지 말고, 오직 알림장에 등록할 본문 문구만 1~2문장으로 간결하게 반환해 주십시오.

[키워드] : ${keywords}`,
      });

      const generatedText = response.text || "";
      res.json({ content: generatedText.trim().replace(/^["']|["']$/g, "") });
    } catch (err: any) {
      console.error("Gemini API Error:", err);
      res.status(500).json({ error: err.message || "알림장 생성 도중 오류가 발생했습니다." });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
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
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
