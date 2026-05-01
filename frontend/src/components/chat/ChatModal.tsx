'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketProvider';
import { chatService, ChatMessage } from '@/app/api/services/chatService';
import { useAuth } from '@/context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { Paperclip, Send, Loader2, X, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, contactId, contactName }) => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, contactId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleReceiveMessage = (message: ChatMessage) => {
      if (message.sender === contactId || message.receiver === contactId) {
        setMessages((prev) => [...prev, message]);
        socket.emit('mark_read', { senderId: message.sender });
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, isOpen, contactId]);

  const fetchMessages = async () => {
    try {
      setIsLoadingMessages(true);
      const data = await chatService.getMessages(contactId);
      setMessages(data);
      if (socket) {
        socket.emit('mark_read', { senderId: contactId });
      }
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !socket || isSending) return;

    setIsSending(true);
    const content = inputMessage.trim();
    setInputMessage('');

    socket.emit(
      'send_message',
      {
        receiverId: contactId,
        content,
      },
      (response: any) => {
        setIsSending(false);
        if (response.error) {
          toast.error(response.error);
          setInputMessage(content);
        } else if (response.success) {
          setMessages((prev) => [...prev, response.message]);
        }
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socket) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      const uploadResult = await chatService.uploadAttachment(file);

      socket.emit(
        'send_message',
        {
          receiverId: contactId,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileName: uploadResult.fileName,
        },
        (response: any) => {
          if (response.error) {
            toast.error(response.error);
          } else if (response.success) {
            setMessages((prev) => [...prev, response.message]);
          }
        }
      );
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <MessageSquare size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Chat with {contactName}
              </h2>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                {isConnected ? (
                  <><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Connected</>
                ) : (
                  <><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span> Connecting...</>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-slate-50 dark:bg-gray-900">
          {isLoadingMessages ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare size={32} className="text-gray-300" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No messages yet</h3>
              <p className="text-sm mt-1 max-w-sm">Start the conversation! Share notes, links, or just say hi.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => (
                <MessageBubble
                  key={message._id}
                  message={message}
                  isOwnMessage={message.sender === user?._id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 bg-slate-100 dark:bg-gray-800 p-2 rounded-2xl"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || !isConnected}
              className="p-2.5 text-gray-500 hover:text-primary transition-colors disabled:opacity-50 shrink-0"
              title="Attach file (max 10MB)"
            >
              {isUploading ? <Loader2 size={20} className="animate-spin text-primary" /> : <Paperclip size={20} />}
            </button>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={isUploading || !isConnected}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 px-2 py-2 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isSending || isUploading || !isConnected}
              className="p-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:hover:bg-black shrink-0 flex items-center justify-center"
            >
              {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
