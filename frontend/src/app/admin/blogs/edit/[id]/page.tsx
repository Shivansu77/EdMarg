'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BlogForm from '@/modules/blog/components/admin/BlogForm';
import {
  BlogInput,
  getBlogByIdForAdmin,
  updateBlogForAdmin,
} from '@/services/blog.service';

function AdminEditBlogContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [initialValues, setInitialValues] = useState<BlogInput | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadBlog = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const blog = await getBlogByIdForAdmin(id);
        setInitialValues({
          title: blog.title,
          slug: blog.slug,
          description: blog.description,
          content: blog.content,
          image: blog.image,
          author: blog.author,
        });
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Failed to load blog');
      } finally {
        setIsLoading(false);
      }
    };

    void loadBlog();
  }, [id]);

  const handleUpdateBlog = async (payload: BlogInput) => {
    if (!id) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await updateBlogForAdmin(id, payload);
      router.push('/admin/blogs?updated=1');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update blog');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout userName="Admin">
      <div className="space-y-6 pb-10">
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-manrope font-extrabold tracking-tight text-gray-900">
            Edit Blog
          </h1>
          <p className="mt-2 text-gray-600">Update your article details and content.</p>
        </section>

        {isLoading ? (
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-600">Loading blog...</p>
          </section>
        ) : initialValues ? (
          <BlogForm
            initialValues={initialValues}
            submitLabel="Update Blog"
            onSubmit={handleUpdateBlog}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
          />
        ) : (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-rose-700">
              {errorMessage || 'Unable to load this blog.'}
            </p>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AdminEditBlogPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminEditBlogContent />
    </ProtectedRoute>
  );
}
