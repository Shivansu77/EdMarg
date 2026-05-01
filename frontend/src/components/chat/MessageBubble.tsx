import React from 'react';
import { ChatMessage } from '@/app/api/services/chatService';
import { Paperclip, FileText, Download } from 'lucide-react';
import Image from 'next/image';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const renderAttachment = () => {
    if (!message.fileUrl) return null;

    const isImage = message.fileType?.startsWith('image/');
    
    if (isImage) {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 max-w-xs">
          <a href={message.fileUrl} target="_blank" rel="noopener noreferrer">
            <Image
              src={message.fileUrl}
              alt="Attachment"
              width={300}
              height={200}
              className="object-cover w-full h-auto hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      );
    }

    return (
      <a
        href={message.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 mt-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="p-2 bg-primary/10 text-primary rounded-md">
          <FileText size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {message.fileName || 'Attachment'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Click to view/download</p>
        </div>
        <Download size={16} className="text-gray-400" />
      </a>
    );
  };

  return (
    <div className={`flex w-full mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-primary text-white rounded-tr-none'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700'
          }`}
        >
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}
          {renderAttachment()}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {time}
        </span>
      </div>
    </div>
  );
};
