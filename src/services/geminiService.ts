import { GoogleGenAI } from "@google/genai";

export type ImageSize = "1K" | "2K" | "4K";
export type AspectRatio = "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";

export interface BannerParams {
  productName: string;
  productDescription: string;
  cta: string;
  targetUrl: string;
  imageSize: ImageSize;
  aspectRatio: AspectRatio;
}

export const generateBanner = async (params: BannerParams): Promise<string> => {
  // 1. Initialize GenAI with the current API key
  // We recreate the instance to ensure it uses the most up-to-date key from the dialog
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  // 2. Refine the prompt using a text model first (optional but recommended for high quality)
  const textModel = "gemini-3-flash-preview";
  const promptRefinement = await ai.models.generateContent({
    model: textModel,
    contents: `Create a highly descriptive, professional visual prompt for an image generation model.
    The goal is to create a high-quality banner ad for a product.
    Product Name: ${params.productName}
    Description: ${params.productDescription}
    Call to Action: ${params.cta}
    
    The prompt should focus on the visual composition, lighting, style (e.g., minimalist, vibrant, cinematic), and product placement. 
    Do not include text in the image generation prompt as the AI might struggle with it, but describe the vibe that fits the CTA: "${params.cta}".
    Make it look like a professional studio product shot or a lifestyle scene.
    Output ONLY the refined prompt text.`,
  });

  const refinedPrompt = promptRefinement.text || `Professional banner ad for ${params.productName}: ${params.productDescription}. High quality, studio lighting, commercial photography style.`;

  // 3. Generate the image using gemini-3-pro-image-preview
  const imageResponse = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [
        {
          text: refinedPrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: params.aspectRatio,
        imageSize: params.imageSize,
      },
    },
  });

  // 4. Extract the image data
  for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }

  throw new Error("No image data returned from Gemini.");
};

export const checkApiKey = async (): Promise<boolean> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    return await (window as any).aistudio.hasSelectedApiKey();
  }
  return false;
};

export const openApiKeyDialog = async (): Promise<void> => {
  if (typeof window !== 'undefined' && (window as any).aistudio) {
    await (window as any).aistudio.openSelectKey();
  }
};
