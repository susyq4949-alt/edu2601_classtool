import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Handle preflight CORS request if needed (optional but good practice)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Only POST requests are allowed" });
  }

  try {
    const { keywords } = req.body || {};
    if (!keywords || typeof keywords !== "string" || !keywords.trim()) {
      return res.status(400).json({ error: "키워드를 입력해 주세요." });
    }

    const apiKey = process.env.Gemini_API_Key || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "서버에 Gemini_API_Key 또는 GEMINI_API_KEY 설정이 비어 있습니다. Vercel 대시보드에서 Environment Variables를 등록해 주세요." 
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
    return res.status(200).json({ content: generatedText.trim().replace(/^["']|["']$/g, "") });
  } catch (err: any) {
    console.error("Gemini API Error on Vercel Serverless Function:", err);
    let errorMsg = err.message || "알림장 생성 도중 오류가 발생했습니다.";
    
    // If the error message or object stringified shows that the API Key has expired or is invalid
    const errStr = JSON.stringify(err);
    if (
      errorMsg.includes("expired") || 
      errorMsg.includes("API key") || 
      errorMsg.includes("API_KEY_INVALID") ||
      errStr.includes("expired") ||
      errStr.includes("API_KEY_INVALID")
    ) {
      errorMsg = "API 키가 만료되었거나 올바르지 않습니다. Vercel 프로젝트 대시보드의 [Settings] > [Environment Variables] 메뉴에서 'Gemini_API_Key' 값을 사용 가능한 유효한 API 키로 업데이트해 주세요! 🔑✨";
    }

    return res.status(500).json({ error: errorMsg });
  }
}
