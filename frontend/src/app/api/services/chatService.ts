import { apiClient } from '@/utils/api-client';

export interface ChatContact {
  _id: string; // The ID of the contact (user)
  name: string;
  email: string;
  profilePicture?: string;
  role: string;
  lastMessage: {
    content?: string;
    fileUrl?: string;
    createdAt: string;
  };
  unreadCount: number;
}

export interface ChatMessage {
  _id: string;
  sender: string;
  receiver: string;
  content?: string;
  fileUrl?: string;
  fileType?: string;
  fileName?: string;
  read: boolean;
  createdAt: string;
}

export const chatService = {
  getContacts: async (): Promise<ChatContact[]> => {
    const response = await apiClient.get<ChatContact[]>('/api/v1/messages/contacts');
    if (!response.success) throw new Error(response.message || 'Failed to get contacts');
    return response.data || [];
  },

  getMessages: async (contactId: string, limit = 50, skip = 0): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(`/api/v1/messages/${contactId}`, {
      params: { limit, skip },
    });
    if (!response.success) throw new Error(response.message || 'Failed to get messages');
    return response.data || [];
  },

  uploadAttachment: async (file: File): Promise<{ fileUrl: string; fileType: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.request<{ fileUrl: string; fileType: string; fileName: string }>('/api/v1/messages/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.success) throw new Error(response.message || 'Failed to upload attachment');
    return response.data!;
  },
};
