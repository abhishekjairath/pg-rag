'use client';

import { useChat, type Message } from '@ai-sdk/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 3
  });
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-wheat">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="flex flex-row items-center">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src="/logo.png" alt="Graham Bot Logo" />
              <AvatarFallback>GB</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-bold text-primary">Paul Graham Bot</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] w-full pr-4">
            <div className="space-y-4">
              {messages.map((m: Message) => (
                <div 
                  key={m.id} 
                  className={`flex gap-3 text-sm ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role !== 'user' && (
                     <Avatar>
                      <AvatarImage src="/pg.png" alt="Graham Bot Logo" />
                      <AvatarFallback>GB</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`p-3 prose prose-sm max-w-none ${m.role === 'user' ? 'bg-secondary text-secondary-foreground rounded-3xl break-words border border-input-border px-4 py-2.5 rounded-br-lg' : ''}`}
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
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              className="flex-1 focus-visible:ring-0 focus-visible:ring-primary/100 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent"
              value={input}
              placeholder="Ask Paul Graham Bot something..."
              onChange={handleInputChange}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}