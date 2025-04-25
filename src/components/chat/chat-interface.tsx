'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
}

// Placeholder doctor data
const doctor = {
  id: 'doc1',
  name: 'Dr. Anya Sharma',
  avatarUrl: 'https://picsum.photos/seed/doc1/40/40'
};

// Placeholder user data
const user = {
    id: 'user1',
    name: 'Patient User', // Added name for fallback
    avatarUrl: 'https://picsum.photos/seed/user1/40/40'
};


export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello! How can I help you today?', sender: 'doctor', timestamp: new Date(Date.now() - 60000 * 5) },
    { id: '2', text: 'Hi Dr. Sharma, I\'ve been having a persistent headache for the past two days.', sender: 'user', timestamp: new Date(Date.now() - 60000 * 3) },
    { id: '3', text: 'Okay, can you describe the headache? Is it dull or sharp? Where is the pain located?', sender: 'doctor', timestamp: new Date(Date.now() - 60000 * 1) },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate doctor response after a short delay
    setTimeout(() => {
        const doctorResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: "Thanks for the information. Based on what you've told me, I recommend scheduling a quick video call to discuss this further. Are you available tomorrow morning?",
            sender: 'doctor',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, doctorResponse]);
    }, 1500);
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollElement) {
            scrollElement.scrollTop = scrollElement.scrollHeight;
        }
    }
  }, [messages]);


  return (
    <div className="flex flex-col h-[500px] border rounded-lg bg-card shadow-sm">
       <div className="p-4 border-b flex items-center space-x-3 bg-secondary rounded-t-lg">
            <Avatar>
              <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
              <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-secondary-foreground">{doctor.name}</p>
              <p className="text-xs text-muted-foreground">Online</p> {/* Placeholder status */}
            </div>
       </div>
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex items-end space-x-2 max-w-[80%]',
                message.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : 'mr-auto'
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.sender === 'user' ? user.avatarUrl : doctor.avatarUrl} />
                <AvatarFallback>{message.sender === 'user' ? user.name.charAt(0) : doctor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  'p-3 rounded-lg shadow-sm',
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted text-muted-foreground rounded-bl-none'
                )}
              >
                <p className="text-sm">{message.text}</p>
                <p className="text-xs mt-1 text-right opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center space-x-2 bg-secondary rounded-b-lg">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow bg-background focus-visible:ring-accent"
          aria-label="Chat message input"
        />
        <Button type="submit" size="icon" aria-label="Send message" className="bg-primary hover:bg-primary/90">
          <Send className="h-4 w-4 text-primary-foreground" />
        </Button>
      </form>
    </div>
  );
}
