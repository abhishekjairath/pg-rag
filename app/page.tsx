'use client';

import { useChat, type Message } from '@ai-sdk/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import { Send } from 'lucide-react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3
  });
  
  // Calculate padding-bottom for scroll area to avoid fixed footer overlap
  const footerHeight = 'h-20'; // Estimate footer height (adjust if needed)
  const scrollAreaPb = `pb-${footerHeight.split('-')[1]}`;

  return (
    // Mobile: Full viewport height, flex column. Desktop: Centered card.
    <div className="flex justify-center items-center min-h-screen bg-wheat md:p-4 lg:p-8">
      {/* Card structure only for md screens and up */}
      <Card className="w-full h-screen md:h-[90vh] max-w-md sm:max-w-lg md:max-w-2xl shadow-lg flex flex-col md:rounded-lg overflow-hidden">
        {/* Header remains similar, adjust padding slightly */}
        <CardHeader className="flex flex-row items-center border-b p-3 md:p-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <Avatar className="w-8 h-8 md:w-10 md:h-10">
              <AvatarImage src="/pg.png" alt="Graham Bot Logo" />
              <AvatarFallback>GB</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-md md:text-lg font-bold text-primary">Paul Graham Bot</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        {/* Content area grows, handles scroll */}
        {/* Mobile: padding-bottom added dynamically. Desktop: standard padding */}
        <CardContent className={`flex-grow overflow-y-auto p-4 ${scrollAreaPb} md:pb-4`}>
          <div className="space-y-4">
            {messages.map((m: Message) => (
              <div 
                key={m.id} 
                className={`flex gap-2 sm:gap-3 text-sm ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Bot avatar */}
                {m.role !== 'user' && (
                   <Avatar className="w-6 h-6 sm:w-8 sm:h-8">
                    <AvatarImage src="/pg.png" alt="Graham Bot Logo" />
                    <AvatarFallback>GB</AvatarFallback>
                  </Avatar>
                )}
                {/* Message bubble/text */}
                <div 
                  className={`${ m.role === 'user' 
                    ? 'prose prose-sm max-w-xs sm:max-w-sm md:max-w-md break-words px-3 py-2 rounded-lg shadow-sm bg-primary text-primary-foreground rounded-br-none' 
                    : 'prose prose-sm prose-p:leading-relaxed max-w-xs sm:max-w-sm md:max-w-md break-words' /* Assistant messages: relaxed leading */ 
                  }`}
                >
                  {m.content.length > 0 ? (
                    <ReactMarkdown>
                      {m.content}
                    </ReactMarkdown>
                  ) : (
                    <span className="italic font-light">
                      {'calling tool: ' + (m.parts?.find(part => part.type === 'tool-invocation') as any)?.toolInvocation.toolName}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>

        {/* Footer: Fixed on mobile, part of flex on desktop. Added top shadow. */}
        <CardFooter className={`relative p-3 md:p-4 border-t bg-background shadow-[0_-5px_10px_-5px_rgba(0,0,0,0.1)] md:relative fixed bottom-0 left-0 w-full ${footerHeight} flex items-center`}>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
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
              disabled={!input.trim()}
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