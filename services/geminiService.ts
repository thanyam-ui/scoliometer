
import { GoogleGenAI, Type } from "@google/genai";

export const getATRAnalysis = async (angle: number) => {
  const absAngle = Math.abs(angle);
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `วิเคราะห์ค่า ATR ${absAngle}° สรุปแบบกระชับมาก (ห้ามมีจุด Bullet points ห้ามมีเครื่องหมายขีด หรือสัญลักษณ์นำหน้าข้อความใดๆ ทั้งสิ้น):
      1. ความเสี่ยง Cobb Angle > 10°: แปลผลให้คนทั่วไปเข้าใจง่าย
      2. เกณฑ์การส่ง X-ray: ควรส่งต่อหรือไม่ (เกณฑ์ 7°)
      3. ค่า Progression: การเปลี่ยนแปลง 3° ถือว่าสำคัญ
      ตอบเป็นภาษาไทย อ้างอิงแบบย่อสุดๆ และห้ามใช้สัญลักษณ์ Bullet`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "สรุปผลสั้นๆ ไม่เอา bullet points" },
            researchData: {
              type: Type.OBJECT,
              properties: {
                cobbPrediction: { type: Type.STRING, description: "ความเสี่ยง Cobb" },
                mcidInfo: { type: Type.STRING, description: "ข้อมูล Progression" },
                citations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Ref ย่อ" }
              },
              required: ["cobbPrediction", "mcidInfo", "citations"]
            }
          },
          required: ["summary", "researchData"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: `ATR ${absAngle}°: ${absAngle >= 7 ? 'แนะนำให้พบแพทย์' : 'เฝ้าระวังเบื้องต้น'}`,
      researchData: {
        cobbPrediction: absAngle >= 5 ? "มีความเสี่ยงที่จะมีแนวกระดูกคดมากกว่า 10 องศา" : "ความเสี่ยงต่อภาวะกระดูกสันหลังคดอยู่ในระดับต่ำ",
        mcidInfo: "หากวัดครั้งต่อไปเปลี่ยนไปเกิน 3 องศา ถือว่ามีการเปลี่ยนแปลงอย่างมีนัยสำคัญ",
        citations: ["Bunnell (1984)"]
      }
    };
  }
};
