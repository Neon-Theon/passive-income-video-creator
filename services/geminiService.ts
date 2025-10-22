
import { GoogleGenAI, Type } from "@google/genai";
import type { SeoData } from '../types';

if (!process.env.API_KEY) {
    // In a real app, you'd want to handle this more gracefully.
    // For this environment, we assume it's set.
    console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key.");
    process.env.API_KEY = "YOUR_API_KEY_HERE";
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SCRIPT_PROMPT = (topic: string) => `
You are an expert YouTube scriptwriter specializing in creating viral content about ethical passive income strategies. Your tone is motivational, informative, and trustworthy.

**Task:** Write a complete, engaging 5-7 minute video script on the topic: "${topic}".

**Requirements:**
1.  **Catchy Intro (0-30 seconds):** Hook the viewer immediately with a bold claim, a relatable problem, or a surprising statistic about passive income.
2.  **Main Content (4-6 minutes):**
    *   Break down the topic into 3-5 clear, actionable, and ethical points or strategies.
    *   For each point, explain what it is, how it works, and the realistic potential.
    *   Use simple, easy-to-understand language. Avoid jargon.
    *   Maintain an upbeat and encouraging tone.
3.  **Affiliate Placeholders:** Naturally integrate placeholders for affiliate links. Use these specific placeholders:
    {/* FIX: Removed backticks around placeholders to prevent breaking the template literal. */}
    *   [INSERT_TOOL_LINK] for relevant software or tools (e.g., website builders, e-commerce platforms).
    *   [INSERT_COURSE_LINK] for educational resources or courses.
    *   [INSERT_AMAZON_LINK] for books or physical products.
4.  **Call to Action & Outro (30-60 seconds):**
    *   Encourage viewers to like, subscribe, and hit the notification bell.
    *   Ask an engaging question to spark comments.
    *   Summarize the key takeaway.
5.  **Disclaimer:** Include a clear disclaimer: "Disclaimer: The information in this video is for educational purposes only and does not constitute financial advice. There are no guarantees of earnings. Results will vary based on effort, market conditions, and other factors."

**Format:**
The script should be well-structured with clear scene breaks or speaker notes.
Example:
---
**(Intro Music Fades)**

**Host:** (Smiling warmly at the camera)
Are you tired of trading your time for money? What if you could build something once that pays you over and over again? Stick around, because today we're unlocking three proven ways to...
---
`;

const THUMBNAIL_PROMPT = (title: string) => `
Create a visually stunning and clickbait-y (in a good way) YouTube thumbnail for a video titled: "${title}".

**Style:**
-   **Vibrant & High-Contrast:** Use bold colors like bright yellows, reds, and electric blues against a dark background.
-   **Dynamic:** Incorporate elements that suggest growth, money, or success (e.g., upward-trending graphs, subtle money icons, glowing effects).
-   **Professional:** Clean, modern design. No clutter.

**Content:**
-   **Main Text:** Include a short, punchy version of the title. Use a thick, bold, easy-to-read font. Example: "EARN $1000/MO" or "PASSIVE INCOME SECRETS".
-   **Focal Image:** A person looking excited or intrigued, or a symbolic graphic like a glowing lightbulb or a rocket ship.
-   **Accents:** Use arrows, circles, or other shapes to draw attention to key elements.

**DO NOT:**
-   Include any text that is hard to read on a small screen.
-   Use generic or boring stock photos.
-   Make it look cheap or scammy.

The final image should be a cinematic, professional photograph that screams "CLICK ME!".
`;

export const generateScript = async (topic: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: SCRIPT_PROMPT(topic),
    config: {
        tools: [{googleSearch: {}}],
    }
  });
  return response.text;
};

export const generateSeoMetadata = async (script: string): Promise<SeoData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Based on the following video script, generate an SEO-optimized title, description, and tags for YouTube.
    
    The description should include timestamps for key sections, placeholders for affiliate links, and calls to action.
    The title should be catchy and keyword-rich.
    Provide 10-15 relevant tags.

    Script:
    ---
    ${script}
    ---
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  const jsonText = response.text.trim();
  return JSON.parse(jsonText);
};


export const generateThumbnail = async (title: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: THUMBNAIL_PROMPT(title),
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const generateVideo = async (script: string, onProgress: (message: string) => void): Promise<string> => {
    // 1. Summarize script for video prompt
    const summaryResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Summarize the following script into a single, concise prompt for an AI video generator. The prompt should describe the key visual theme of the video. For example: "A dynamic and motivational video about starting an online business, featuring clips of people working on laptops, upward-trending graphs, and digital product mockups."
        
        Script:
        ---
        ${script}
        ---`
    });
    const videoPrompt = summaryResponse.text;

    onProgress("Crafting video concept...");
    
    // 2. Generate video
    let operation = await ai.models.generateVideos({
        model: 'veo-2.0-generate-001',
        prompt: `Create a 15-second, visually engaging, professional stock-style video clip representing this concept: ${videoPrompt}. Include dynamic motion and an optimistic, modern aesthetic.`,
        config: {
            numberOfVideos: 1
        }
    });

    onProgress("AI is rendering your video... this can take a few minutes.");

    // 3. Poll for completion
    let pollCount = 0;
    while (!operation.done) {
        pollCount++;
        const waitTime = 10000; // 10 seconds
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        const minutesElapsed = (pollCount * 10 / 60).toFixed(1);
        onProgress(`Rendering in progress... (${minutesElapsed} mins elapsed). The AI is working hard!`);

        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch (error) {
            console.error("Polling error:", error);
            // Don't throw, just log and continue polling
        }
    }

    if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
        throw new Error("Video generation completed, but no video URI was found.");
    }
    
    const downloadLink = operation.response.generatedVideos[0].video.uri;
    
    onProgress("Fetching final video file...");
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    
    if(!videoResponse.ok) {
        throw new Error(`Failed to download video file. Status: ${videoResponse.statusText}`);
    }

    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};