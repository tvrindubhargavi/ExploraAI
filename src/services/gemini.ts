import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const MODEL_NAME = "gemini-3-flash-preview";

export async function identifyLandmark(base64Image: string) {
  const imagePart = {
    inlineData: {
      mimeType: "image/jpeg",
      data: base64Image,
    },
  };
  const textPart = {
    text: "Identify this landmark. Provide its name, location, and a brief historical fact. Return the response in plain text.",
  };

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [{ parts: [imagePart, textPart] }],
  });
  
  return response.text;
}

export async function translateText(text: string, targetLanguage: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Translate the following text to ${targetLanguage}: "${text}". Only return the translated text.`,
  });
  return response.text;
}

export async function generateItinerary(city: string, budget: number, days: number, preferences: string[]) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Generate a detailed day-wise travel itinerary for ${city} with a budget of ${budget} for ${days} days. Preferences: ${preferences.join(", ")}. Return a JSON object with a 'title' string and an 'itinerary' array of objects, each containing 'day' (number) and 'activities' (array of strings).`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                itinerary: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            day: { type: Type.NUMBER },
                            activities: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["day", "activities"]
                    }
                }
            },
            required: ["title", "itinerary"]
        }
    }
  });

  const text = response.text;
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", e);
    return null;
  }
}

export async function getPlaceDetails(placeName: string) {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: `Provide detailed history and timings for the popular tourist spot: "${placeName}". 
    Format your response as a JSON object with keys: "name", "history", "timings", "bestTimeToVisit", "tips". 
    Be informative and structured.`,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                history: { type: Type.STRING },
                timings: { type: Type.STRING },
                bestTimeToVisit: { type: Type.STRING },
                tips: { type: Type.STRING }
            },
            required: ["name", "history", "timings", "bestTimeToVisit", "tips"]
        }
    }
  });

  const text = response.text || "{}";
  
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Parse Error:", e);
    return null;
  }
}

export async function getChatResponse(message: string, history: any[]) {
    // Correct way to handle chat with @google/genai
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: [
            ...history.map(h => ({
                role: h.role,
                parts: [{ text: h.parts[0].text }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ]
    });
    return response.text;
}
