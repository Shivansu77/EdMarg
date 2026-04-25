/* eslint-disable @next/next/no-img-element */
'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import RichTextEditor from './RichTextEditor';
import type { BlogInput } from '@/services/blog.service';

type BlogFormProps = {
  initialValues?: BlogInput;
  submitLabel: string;
  onSubmit: (payload: BlogInput) => Promise<void>;
  isSubmitting: boolean;
  errorMessage?: string | null;
};

const defaultValues: BlogInput = {
  title: '',
  slug: '',
  description: '',
  content: '<p></p>',
  image: '',
  author: 'Admin',
};

const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export default function BlogForm({
  initialValues,
  submitLabel,
  onSubmit,
  isSubmitting,
  errorMessage,
}: BlogFormProps) {
  const [form, setForm] = useState<BlogInput>(initialValues || defaultValues);
  const [slugTouched, setSlugTouched] = useState(Boolean(initialValues?.slug));
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
     
    setForm(initialValues || defaultValues);
    setSlugTouched(Boolean(initialValues?.slug));
  }, [initialValues]);

  useEffect(() => {
    if (slugTouched) {
      return;
    }

     
    setForm((currentForm) => ({
      ...currentForm,
      slug: slugify(currentForm.title),
    }));
  }, [form.title, slugTouched]);

  const previewImage = useMemo(() => {
    if (!form.image.trim()) {
      return null;
    }
    return form.image;
  }, [form.image]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setValidationError(null);

    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) {
      setValidationError('Title, slug, and content are required.');
      return;
    }

    await onSubmit({
      ...form,
      title: form.title.trim(),
      slug: slugify(form.slug),
      description: form.description.trim(),
      image: form.image.trim(),
      author: form.author.trim() || 'Admin',
      content: form.content,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {(validationError || errorMessage) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {validationError || errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-gray-700">Title</span>
          <input
            value={form.title}
            onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            placeholder="Enter blog title"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-700">Slug</span>
          <input
            value={form.slug}
            onChange={(event) => {
              setSlugTouched(true);
              setForm((prev) => ({ ...prev, slug: event.target.value }));
            }}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            placeholder="blog-slug"
            required
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-gray-700">Author</span>
          <input
            value={form.author}
            onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            placeholder="Admin"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-gray-700">Description</span>
          <textarea
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            placeholder="Short blog summary"
          />
        </label>

        <label className="space-y-2 sm:col-span-2">
          <span className="text-sm font-semibold text-gray-700">Image URL</span>
          <input
            value={form.image}
            onChange={(event) => setForm((prev) => ({ ...prev, image: event.target.value }))}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
            placeholder="https://..."
          />
        </label>

        {previewImage && (
          <div className="sm:col-span-2 overflow-hidden rounded-xl border border-gray-200">
            <img
              src={previewImage}
              alt="Blog preview"
              className="h-44 w-full object-cover"
              onError={(event) => {
                event.currentTarget.src =
                  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=80';
              }}
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Content</p>
        <RichTextEditor
          value={form.content}
          onChange={(nextValue) => setForm((prev) => ({ ...prev, content: nextValue }))}
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
