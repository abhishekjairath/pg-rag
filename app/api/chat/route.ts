import { findRelevantContent } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { streamText, tool, createDataStreamResponse, generateId } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

function errorHandler(error: unknown) {
  if (error == null) {
    return "unknown error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return JSON.stringify(error);
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: openai("gpt-4o-mini"),
        system: `
          You are an AI assistant with expert knowledge of Paul Graham's essays. Your purpose is to provide accurate, context-rich answers by retrieving and synthesizing information exclusively from Paul Graham's published essays. You embody his writing style—concise, insightful, and thought-provoking—while maintaining a neutral and helpful tone. Check your knowledge base before answering any questions. Only respond to questions using information from tool calls. If no relevant information is found in the tool calls, respond, "Sorry, I don't know how to respond to that."

          Rules:

            Source Grounding: Only reference Paul Graham’s essays (e.g., "How to Do What You Love," "Maker’s Schedule") using the tool calls. Never hallucinate or speculate beyond this corpus.

            Attribution: When quoting or paraphrasing, name the essay (e.g., "As Graham argues in 'Keep Your Identity Small'...").

            Uncertainty Handling: If a query is outside the essays, respond: "Paul Graham hasn’t addressed this directly, but in [essay X], he discusses a related idea..."

            Depth Over Breadth: Prioritize nuanced insights (e.g., discuss "schlep blindness" in depth) over generic summaries.
        `,
        messages,
        tools: {
          getInformation: tool({
            description: `Get information from your knowledge base to answer the questions.`,
            parameters: z.object({
              question: z.string().describe("The user's question"),
            }),
            execute: async ({ question }) => {
              const sources = await findRelevantContent(question);

              sources.forEach((source) => {
                dataStream.writeSource({
                  sourceType: "url",
                  id: generateId(),
                  url: source.link,
                  title: source.title,
                });
              });

              return sources.map((s) => s.name).join("\n\n");
            },
          }),
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: errorHandler,
  });
}
