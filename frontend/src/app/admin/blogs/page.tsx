'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { BlogPost } from '@/modules/blog/types';
import { deleteBlogForAdmin, getAllBlogsFromAPI } from '@/services/blog.service';

function AdminBlogsContent() {
  const searchParams = useSearchParams();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBlogsFromAPI();
      setBlogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBlogs();
  }, []);

  useEffect(() => {
    if (searchParams.get('created') === '1') {
      setSuccessMessage('Blog created successfully.');
      return;
    }

    if (searchParams.get('updated') === '1') {
      setSuccessMessage('Blog updated successfully.');
    }
  }, [searchParams]);

  const handleDelete = async (blogId: string) => {
    const shouldDelete = window.confirm('Delete this blog permanently?');
    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingBlogId(blogId);
      await deleteBlogForAdmin(blogId);
      setSuccessMessage('Blog deleted successfully.');
      await loadBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete blog');
    } finally {
      setDeletingBlogId(null);
    }
  };

  return (
    <DashboardLayout userName="Admin">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
                Blog Management
              </h1>
              <p className="mt-2 text-gray-600">Create, update, and publish blog content.</p>
            </div>

            <Link
              href="/admin/blogs/create"
              className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-900"
            >
              Create Blog
            </Link>
          </div>
        </section>

        {successMessage && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6">
          {loading ? (
            <p className="text-sm font-semibold text-gray-600">Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <h2 className="text-xl font-bold text-gray-900">No blogs created yet</h2>
              <p className="mt-2 text-sm text-gray-600">Create your first blog to see it listed here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 border-collapse">
                <thead>
                  <tr className="text-left">
                    <th className="border-b border-gray-100 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Title</th>
                    <th className="border-b border-gray-100 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Author</th>
                    <th className="border-b border-gray-100 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                    <th className="border-b border-gray-100 pb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-gray-50">
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-gray-900">{blog.title}</p>
                        <p className="text-xs text-gray-500 mt-1">/{blog.slug}</p>
                      </td>
                      <td className="py-4 pr-4 text-sm text-gray-700">{blog.author || 'Admin'}</td>
                      <td className="py-4 pr-4 text-sm text-gray-700">{new Date(blog.date).toLocaleDateString()}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/blogs/edit/${blog.id}`}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-50"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => void handleDelete(blog.id)}
                            disabled={deletingBlogId === blog.id}
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                          >
                            {deletingBlogId === blog.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}

export default function AdminBlogsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminBlogsContent />
    </ProtectedRoute>
  );
}
