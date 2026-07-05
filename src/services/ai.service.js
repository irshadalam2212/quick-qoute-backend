import { ai } from "../config/gemini.js";

export const generateScopeDescription = async (userInput) => {
  const prompt = `
You are a Senior Civil Engineer, Quantity Surveyor, and Estimation Expert.

Your task is to convert the user's rough sentence into a professional Scope of Work suitable for a construction quotation.

Rules:

- Use professional BOQ / quotation language.
- Start every description with words like:
   - Providing and fixing
   - Providing and laying
   - Supplying, providing and installing
   - Fabricating and installing
- Preserve:
   - Brand names
   - Tile sizes
   - Material names
   - Room names
   - Thickness
   - Finish
- Include labour, material and workmanship.
- Do NOT mention price.
- Keep between 30-80 words.
- Understand English, Hindi and Hinglish.
- Return ONLY the final scope description.
- Do not use markdown.
- Do not use bullet points.
- Make it suitable for civil/interior quotations.

User Input:
"${userInput}"
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
};
