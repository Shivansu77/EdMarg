import { BlogPost } from '@/modules/blog/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 * Map API response to frontend BlogPost type
 */
function mapApiBlogToPost(apiBlog: any): BlogPost {
  return {
    id: apiBlog._id || Math.random(), // Use MongoDB _id or fallback
    title: apiBlog.title || '',
    slug: apiBlog.slug || '',
    description: apiBlog.description || '',
    image: apiBlog.image || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1600&q=80', // Fallback image
    author: apiBlog.author || 'EdMarg',
    date: apiBlog.created_at || new Date().toISOString(),
    content: apiBlog.content || '<p>Content not available</p>',
    tags: apiBlog.tags || [], // Backend doesn't have tags, use empty array
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

    const data = await response.json();
    
    // Handle both { data: [...] } and { success: true, data: [...] } formats
    const blogsData = data.data || data;
    
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

    const data = await response.json();
    const blogData = data.data || data;

    return mapApiBlogToPost(blogData);
  } catch (error) {
    console.error(`Error fetching blog with slug ${slug}:`, error);
    throw error;
  }
}
