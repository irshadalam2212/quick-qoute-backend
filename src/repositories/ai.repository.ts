import { ai } from "../config/gemini.js";

export const aiRepository = {
  generateText(prompt: string) {
    return ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
  },
};
