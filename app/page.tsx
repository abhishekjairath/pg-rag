'use client';

import { useChat, type Message } from '@ai-sdk/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

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
                  {m.role === 'user' && (
                    <Avatar>
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                  {m.role !== 'user' && (
                     <Avatar>
                      <AvatarImage src="/pg.png" alt="Graham Bot Logo" />
                      <AvatarFallback>GB</AvatarFallback>
                    </Avatar>
                  )}
                  <div 
                    className={`p-3 rounded-lg shadow-md ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
                  >
                    <p className="leading-relaxed">
                      {m.content.length > 0 ? (
                        m.content
                      ) : (
                        <span className="italic font-light">
                          {'calling tool: ' + (m.parts?.find(part => part.type === 'tool-invocation') as any)?.toolInvocation.toolName}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Input
              className="flex-1"
              value={input}
              placeholder="Ask Graham Bot something..."
              onChange={handleInputChange}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}