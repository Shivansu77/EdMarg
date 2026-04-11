import { BlogPost } from '@/modules/blog/types';
import { apiClient } from '@/utils/api-client';

const API_BASE_URL = 'https://edmarg.onrender.com';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80';

export interface BlogInput {
  title: string;
  slug: string;
  description: string;
  content: string;
  image: string;
  author: string;
}

interface ApiBlog {
  _id: string;
  title?: string;
  slug?: string;
  description?: string;
  image?: string;
  author?: string;
  created_at?: string;
  content?: string;
}

/**
 * Map API response to frontend BlogPost type
 */
function mapApiBlogToPost(apiBlog: ApiBlog): BlogPost {
  return {
    id: apiBlog._id || '',
    title: apiBlog.title || '',
    slug: apiBlog.slug || '',
    description: apiBlog.description || '',
    image: apiBlog.image || FALLBACK_IMAGE,
    author: apiBlog.author || 'EdMarg',
    date: apiBlog.created_at || new Date().toISOString(),
    content: apiBlog.content || '<p>Content not available</p>',
    tags: [],
  };
}

/**
 * Fetch all blogs from API
 */
export async function getAllBlogsFromAPI(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache to get fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blogs: ${response.status}`);
    }

    const data = await response.json() as { data?: ApiBlog[] };
    
    // Handle both { data: [...] } and { success: true, data: [...] } formats
    const blogsData = data.data || [];
    
    if (!Array.isArray(blogsData)) {
      console.warn('Unexpected API response format:', data);
      return [];
    }

    return blogsData.map(mapApiBlogToPost);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
}

/**
 * Fetch single blog by slug from API
 */
export async function getBlogBySlugFromAPI(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/blogs/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch blog: ${response.status}`);
    }

    const data = await response.json() as { data?: ApiBlog };
    const blogData = data.data || data;

    return mapApiBlogToPost(blogData as ApiBlog);
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    throw error;
  }
}

export async function getBlogByIdForAdmin(id: string): Promise<BlogPost> {
  const response = await apiClient.get<ApiBlog>(`/api/blogs/id/${id}`);
  if (!response.success || !response.data) {
    throw new Error(response.error || response.message || 'Failed to fetch blog');
  }

  return mapApiBlogToPost(response.data);
}

export async function createBlogForAdmin(payload: BlogInput): Promise<BlogPost> {
  const response = await apiClient.post<ApiBlog>('/api/blogs', payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || response.message || 'Failed to create blog');
  }

  return mapApiBlogToPost(response.data);
}

export async function updateBlogForAdmin(id: string, payload: BlogInput): Promise<BlogPost> {
  const response = await apiClient.put<ApiBlog>(`/api/blogs/${id}`, payload);
  if (!response.success || !response.data) {
    throw new Error(response.error || response.message || 'Failed to update blog');
  }

  return mapApiBlogToPost(response.data);
}

export async function deleteBlogForAdmin(id: string): Promise<void> {
  const response = await apiClient.delete(`/api/blogs/${id}`);
  if (!response.success) {
    throw new Error(response.error || response.message || 'Failed to delete blog');
  }
}
