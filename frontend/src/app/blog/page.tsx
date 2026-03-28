import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BlogListClient from '@/components/blog/BlogListClient';
import { getAllBlogPosts, getAllBlogTags } from '@/data/blogs';

export default function BlogPage() {
  const posts = getAllBlogPosts();
  const tags = getAllBlogTags();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-6 pb-16 pt-28 lg:px-8 lg:pt-32">
        <section className="mb-10 rounded-3xl border border-blue-100 bg-linear-to-br from-white via-blue-50 to-indigo-100 p-8 sm:p-10">
          <p className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            EdMarg Insights
          </p>
          <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Career stories, practical frameworks, and mentor-backed guidance
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Explore actionable articles on career planning, mentorship, portfolio building, and student growth.
          </p>
        </section>

        <BlogListClient posts={posts} tags={tags} />
      </main>

      <Footer />
    </div>
  );
}
