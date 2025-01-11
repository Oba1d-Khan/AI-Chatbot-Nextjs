import { Message, streamText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateKeyPairSync } from "crypto";
import { initialMessage } from "@/lib/data";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});
const buildGoogleGenAiPrompt = (messages: Message[]): Message[] => [
  {
    id: generateId(),
    role: "user",
    content: initialMessage.content,
  },
  ...messages.map((message) => ({
    id: message.id || generateId(),
    role: message.role,
    content: message.content,
  })),
];

export const runtime = "edge";

const generateId = () => Math.random().toString(36).slice(2, 15);

export async function POST(request: Request) {
  const { messages } = await request.json();
  const stream = await streamText({
    model: google("gemini-pro"),
    messages: buildGoogleGenAiPrompt(messages),
    temperature: 0.7,
  });

  return stream.toDataStreamResponse();
}
