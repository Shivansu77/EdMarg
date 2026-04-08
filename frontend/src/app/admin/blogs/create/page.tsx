'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BlogForm from '@/modules/blog/components/admin/BlogForm';
import { createBlogForAdmin, BlogInput } from '@/services/blog.service';

function AdminCreateBlogContent() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCreateBlog = async (payload: BlogInput) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await createBlogForAdmin(payload);
      router.push('/admin/blogs?created=1');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to create blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userName="Admin">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
            Create Blog
          </h1>
          <p className="mt-2 text-gray-600">Write and publish a new blog article.</p>
        </section>

        <BlogForm
          submitLabel="Create Blog"
          onSubmit={handleCreateBlog}
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>
    </DashboardLayout>
  );
}

export default function AdminCreateBlogPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminCreateBlogContent />
    </ProtectedRoute>
  );
}
