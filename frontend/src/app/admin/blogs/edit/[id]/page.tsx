import { getAllBlogsFromAPI } from '@/services/blog.service';
import AdminEditBlogClient from './AdminEditBlogClient';

export async function generateStaticParams() {
  try {
    const blogs = await getAllBlogsFromAPI();
    const params = blogs
      .filter((blog) => Boolean(blog.id))
      .map((blog) => ({ id: blog.id }));
    // `output: export` requires at least one param
    return params.length > 0 ? params : [{ id: 'placeholder' }];
  } catch (error) {
    console.error('Failed to generate admin blog edit static params:', error instanceof Error ? error.message : String(error));
    return [{ id: 'placeholder' }];
  }
}

export default function AdminEditBlogPage() {
  return <AdminEditBlogClient />;
}

