import { GoogleGenAI, Type } from "@google/genai";
import { LANDMARKS } from "../constants";
import { MakeupLook } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const MAKEUP_LOOK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    thumbnail: { type: Type.STRING },
    steps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          productType: { 
            type: Type.STRING,
            enum: ['foundation', 'concealer', 'blush', 'contour', 'highlight', 'eyeshadow', 'eyeliner', 'lipstick', 'brows']
          },
          color: { type: Type.STRING, description: "Hex color code" },
          opacity: { type: Type.NUMBER, description: "0 to 1" },
          landmarks: { 
            type: Type.ARRAY, 
            items: { type: Type.INTEGER },
            description: "Indices of landmarks. Use the provided LANDMARKS mapping."
          },
          style: { 
            type: Type.STRING,
            enum: ['fill', 'outline', 'dots']
          }
        },
        required: ['id', 'title', 'description', 'productType', 'color', 'opacity', 'landmarks', 'style']
      }
    }
  },
  required: ['id', 'name', 'description', 'thumbnail', 'steps']
};

const SYSTEM_INSTRUCTION = `You are a professional makeup artist and AR expert. 
Your task is to generate a structured "Makeup Map" for a given trend or image.
You must return a JSON object that matches the provided schema.

Available Landmark Groups (use these indices):
LIPS: ${JSON.stringify(LANDMARKS.LIPS)}
LEFT_EYE: ${JSON.stringify(LANDMARKS.LEFT_EYE)}
RIGHT_EYE: ${LANDMARKS.RIGHT_EYE}
LEFT_BROW: ${LANDMARKS.LEFT_BROW}
RIGHT_BROW: ${LANDMARKS.RIGHT_BROW}
CHEEKS_LEFT: ${LANDMARKS.CHEEKS_LEFT}
CHEEKS_RIGHT: ${LANDMARKS.CHEEKS_RIGHT}
CONTOUR_CHEEKS: ${LANDMARKS.CONTOUR_CHEEKS}
NOSE_BRIDGE: ${LANDMARKS.NOSE_BRIDGE}
FACE_OVAL: ${LANDMARKS.FACE_OVAL}

Guidelines:
1. For foundation, use FACE_OVAL.
2. For blush, use CHEEKS_LEFT and CHEEKS_RIGHT.
3. For contour, use CONTOUR_CHEEKS.
4. For highlight, use NOSE_BRIDGE and high points of cheeks.
5. For eyeshadow/eyeliner, use LEFT_EYE and RIGHT_EYE.
6. For lipstick, use LIPS.
7. For brows, use LEFT_BROW and RIGHT_BROW.

Always provide a realistic description and professional hex colors.`;

export async function generateLookFromTrend(trendName: string): Promise<MakeupLook> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a makeup look for the trend: "${trendName}". Search for this trend if needed to understand its characteristics.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: MAKEUP_LOOK_SCHEMA,
      tools: [{ googleSearch: {} }]
    }
  });

  return JSON.parse(response.text);
}

export async function generateLookFromImage(imageBase64: string, description: string): Promise<MakeupLook> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64.split(',')[1] // Remove data:image/jpeg;base64,
        }
      },
      {
        text: `Analyze this image and create a makeup map to copy this look. Additional context: ${description}`
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: MAKEUP_LOOK_SCHEMA
    }
  });

  return JSON.parse(response.text);
}
