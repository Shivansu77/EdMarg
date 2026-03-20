import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#FCFCFC] w-full pt-16 pb-12 px-5 md:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Top Content: Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-12">

          {/* Brand & Mission Column (Takes up 2 cols on lg) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                EdMarg
              </span>
            </Link>

            <p className="text-[#64748b] text-sm leading-relaxed max-w-[280px] mb-8 font-medium">
              On a mission to democratize mentorship and career growth for everyone.
              <br className="mb-2" />
              Designed and built with ❤️ by the EdMarg Team.
            </p>

            <div className="mt-auto text-sm text-[#94a3b8] font-medium hidden lg:block">
              © {new Date().getFullYear()} EdMarg Inc.
            </div>
          </div>

          {/* Company */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[15px] text-[#1e293b] mb-1 tracking-tight">Company</h4>
            {['About us', 'Contact', 'Partnership', 'Blog'].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-[14px] text-[#64748b] font-medium hover:text-blue-600 transition-colors inline-block w-fit"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Product & Resources Combined to somewhat match reference */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[15px] text-[#1e293b] mb-1 tracking-tight">Product</h4>
              {['Find a mentor', 'Become a mentor', 'Masterclasses'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-[14px] text-[#64748b] font-medium hover:text-blue-600 transition-colors inline-block w-fit"
                >
                  {link}
                </Link>
              ))}
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[15px] text-[#1e293b] mb-1 tracking-tight mt-2">Resources</h4>
              {['Career Guides', 'Interview Prep Book', 'Free tools'].map((link) => (
                <Link
                  key={link}
                  href="#"
                  className="text-[14px] text-[#64748b] font-medium hover:text-blue-600 transition-colors inline-block w-fit"
                >
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[15px] text-[#1e293b] mb-1 tracking-tight">Support</h4>
            {['FAQs', 'Help center', 'Terms of service', 'Privacy policy', 'Site map'].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-[14px] text-[#64748b] font-medium hover:text-blue-600 transition-colors inline-block w-fit"
              >
                {link}
              </Link>
            ))}
          </div>

          {/* Follow us */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-[15px] text-[#1e293b] mb-1 tracking-tight">Follow us</h4>
            {['LinkedIn', 'X (Twitter)', 'Instagram', 'YouTube'].map((link) => (
              <Link
                key={link}
                href="#"
                className="text-[14px] text-[#64748b] font-medium hover:text-blue-600 transition-colors inline-block w-fit"
              >
                {link}
              </Link>
            ))}
          </div>

        </div>

        {/* Mobile Copyright (Visible only on small screens) */}
        <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-[#94a3b8] font-medium block lg:hidden">
          © {new Date().getFullYear()} EdMarg Inc.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
