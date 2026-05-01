'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/context/SocketProvider';
import { chatService, ChatContact, ChatMessage } from '@/app/api/services/chatService';
import { useAuth } from '@/context/AuthContext';
import { MessageBubble } from './MessageBubble';
import { Paperclip, Send, Loader2, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChatLayout = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, []);

  // Fetch messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      fetchMessages(selectedContact._id);
    }
  }, [selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !selectedContact) return;

    const handleReceiveMessage = (message: ChatMessage) => {
      if (message.sender === selectedContact._id || message.receiver === selectedContact._id) {
        setMessages((prev) => [...prev, message]);
        // Mark as read immediately if the chat is open
        socket.emit('mark_read', { senderId: message.sender });
      }
      
      // Update contacts list last message
      setContacts((prev) =>
        prev.map((c) =>
          c._id === message.sender || c._id === message.receiver
            ? { ...c, lastMessage: message }
            : c
        )
      );
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, selectedContact]);

  const fetchContacts = async () => {
    try {
      setIsLoadingContacts(true);
      const data = await chatService.getContacts();
      setContacts(data);
      if (data.length > 0 && !selectedContact) {
        setSelectedContact(data[0]);
      }
    } catch (error) {
      toast.error('Failed to load contacts');
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      setIsLoadingMessages(true);
      const data = await chatService.getMessages(contactId);
      setMessages(data);
      // Mark read when fetching
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
    if (!inputMessage.trim() || !selectedContact || !socket || isSending) return;

    setIsSending(true);
    const content = inputMessage.trim();
    setInputMessage('');

    socket.emit(
      'send_message',
      {
        receiverId: selectedContact._id,
        content,
      },
      (response: any) => {
        setIsSending(false);
        if (response.error) {
          toast.error(response.error);
          setInputMessage(content); // Restore input on failure
        } else if (response.success) {
          setMessages((prev) => [...prev, response.message]);
          updateContactListWithLastMessage(response.message);
        }
      }
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedContact || !socket) return;

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
          receiverId: selectedContact._id,
          fileUrl: uploadResult.fileUrl,
          fileType: uploadResult.fileType,
          fileName: uploadResult.fileName,
        },
        (response: any) => {
          if (response.error) {
            toast.error(response.error);
          } else if (response.success) {
            setMessages((prev) => [...prev, response.message]);
            updateContactListWithLastMessage(response.message);
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

  const updateContactListWithLastMessage = (message: ChatMessage) => {
    setContacts((prev) => {
      const existing = prev.find((c) => c._id === message.receiver || c._id === message.sender);
      if (existing) {
        return prev.map((c) => (c._id === existing._id ? { ...c, lastMessage: message } : c));
      }
      return prev;
    });
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Sidebar - Contacts */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Messages</h2>
          <p className="text-xs text-gray-500 mt-1">
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-500">
                <span className="w-2 h-2 rounded-full bg-red-500"></span> Disconnected
              </span>
            )}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoadingContacts ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : contacts.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No recent contacts. When you book a session, you'll be able to chat here.
            </div>
          ) : (
            contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full text-left p-4 flex items-start gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 ${
                  selectedContact?._id === contact._id ? 'bg-primary/5 dark:bg-primary/10' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {contact.profilePicture ? (
                    <img
                      src={contact.profilePicture}
                      alt={contact.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon size={20} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {contact.name}
                    </h3>
                    {contact.lastMessage?.createdAt && (
                      <span className="text-xs text-gray-500">
                        {new Date(contact.lastMessage.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {contact.lastMessage?.content ||
                      (contact.lastMessage?.fileUrl ? 'Sent an attachment' : 'Say hi!')}
                  </p>
                </div>
                {contact.unreadCount > 0 && selectedContact?._id !== contact._id && (
                  <div className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-medium mt-2">
                    {contact.unreadCount}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {selectedContact.profilePicture ? (
                  <img
                    src={selectedContact.profilePicture}
                    alt={selectedContact.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={20} className="text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {selectedContact.name}
                </h2>
                <p className="text-xs text-gray-500 capitalize">{selectedContact.role}</p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                    <UserIcon size={32} className="text-gray-400" />
                  </div>
                  <p>No messages yet.</p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwnMessage={message.sender === user?._id}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-2 rounded-2xl"
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
                  className="p-2 text-gray-500 hover:text-primary transition-colors disabled:opacity-50"
                  title="Attach file (max 10MB)"
                >
                  {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Paperclip size={20} />}
                </button>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={isUploading || !isConnected}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-gray-100 px-2"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isSending || isUploading || !isConnected}
                  className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-50/30 dark:bg-gray-900/30">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <UserIcon size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Messages</h3>
            <p className="mt-1 max-w-sm">
              Select a contact from the sidebar to start chatting, share files, and discuss session details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
