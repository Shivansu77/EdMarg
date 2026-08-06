import { getAllBlogsFromAPI } from '@/services/blog.service';
import AdminEditBlogClient from './AdminEditBlogClient';

export async function generateStaticParams() {
  try {
    const blogs = await getAllBlogsFromAPI();
    return blogs
      .filter((blog) => Boolean(blog.id))
      .map((blog) => ({ id: blog.id }));
  } catch (error) {
    console.error('Failed to generate admin blog edit static params:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

export default function AdminEditBlogPage() {
  return <AdminEditBlogClient />;
}

