"use client";

import { useChat, type Message } from "@ai-sdk/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import { Send, BookOpen } from "lucide-react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    maxSteps: 3,
  });

  const footerHeight = "h-20";
  const scrollAreaPb = `pb-${footerHeight.split("-")[1]}`;

  return (
    <div className="flex justify-center items-center min-h-screen bg-wheat md:p-4 lg:p-8">
      <Card className="w-full h-screen md:h-[90vh] max-w-md sm:max-w-lg md:max-w-2xl shadow-lg flex flex-col md:rounded-lg overflow-hidden">
        <CardHeader className="flex flex-row items-center border-b p-3 md:p-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Avatar className="w-8 h-8 md:w-10 md:h-10">
              <AvatarImage src="/pg.png" alt="Graham Bot Logo" />
              <AvatarFallback>GB</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md md:text-lg font-bold text-primary">
                Paul Graham Bot
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent
          className={`flex-grow overflow-y-auto p-4 ${scrollAreaPb} md:pb-4`}
        >
          <div className="space-y-4">
            {messages.map((m: Message) => {
              const messageSources = m.parts?.filter(
                (part) => part.type === "source"
              );
              const uniqueSourcesMap = new Map<string, any>();
              messageSources?.forEach(({ source }) => {
                if (source.url && !uniqueSourcesMap.has(source.url)) {
                  uniqueSourcesMap.set(source.url, source);
                }
              });
              const uniqueSources = Array.from(uniqueSourcesMap.values());

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${ m.role === "user" ? "items-end" : "items-start" }`}
                >
                  <div
                    className={`flex gap-2 sm:gap-3 text-sm ${ m.role === "user" ? "justify-end" : "justify-start" } w-full`}
                  >
                    {m.role !== "user" && (
                      <Avatar className="w-6 h-6 sm:w-8 sm:h-8 self-start"> 
                        <AvatarImage src="/pg.png" alt="Graham Bot Logo" />
                        <AvatarFallback>GB</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`${ m.role === "user"
                          ? "prose prose-sm max-w-xs sm:max-w-sm md:max-w-md break-words px-3 py-2 rounded-lg shadow-sm bg-primary text-primary-foreground rounded-br-none"
                          : "prose prose-sm prose-p:leading-relaxed max-w-xs sm:max-w-sm md:max-w-md break-words" 
                      }`}
                    >
                      {m.content.length > 0 ? (
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      ) : (
                        <span className="italic font-light">
                          {"calling tool: " +
                            (
                              m.parts?.find(
                                (part) => part.type === "tool-invocation"
                              ) as any
                            )?.toolInvocation.toolName}
                        </span>
                      )}
                    </div>
                    {m.role === "user" && <div className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"></div>} 
                  </div>
                  {uniqueSources.length > 0 && (
                    <div className="mt-2 pt-2 pl-8 sm:pl-11 w-full max-w-xs sm:max-w-sm md:max-w-md">
                      <h3 className="text-xs font-semibold mb-1 flex items-center text-gray-600">
                        <BookOpen className="w-3 h-3 mr-1" /> Sources:
                      </h3>
                      <ul className="list-none space-y-1 text-xs">
                        {uniqueSources.map((source) => (
                          <li key={source.id}>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-words"
                            >
                              {source.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>

        <CardFooter
          className={`p-3 md:p-4 border-t bg-background shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.1)] md:relative fixed bottom-0 left-0 w-full ${footerHeight} flex items-center`}
        >
          <form
            onSubmit={(e) => {
              handleSubmit(e);
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 pr-12 bg-transparent h-10"
              value={input}
              placeholder="Ask Paul Graham Bot something..."
              onChange={handleInputChange}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full disabled:opacity-50"
              disabled={!input.trim() || status !== "ready"}
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
