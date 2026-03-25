import React from 'react';
import { ArrowRight, Check, X } from 'lucide-react';

const BEFORE_LIST = [
  'Endless scrolling through job boards',
  'Anxiety about choosing the wrong major',
  'Listening to conflicting advice from peers',
  'Fear of being stuck in a 9-5 you hate',
];

const AFTER_LIST = [
  'Data-backed clarity on your best-fit career',
  'Direct connection with industry-leading mentors',
  'A structured 5-year roadmap for success',
  'Confidence to pursue your true passion',
];

const TransformSection = () => {
  return (
    <section className="overflow-hidden bg-white py-20 lg:py-28 border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            From Confusion to Clarity
          </h2>
          <p className="text-lg text-gray-600">
            See the transformation EdMarg brings to your career journey
          </p>
        </div>

        {/* Split Screen */}
        <div className="flex flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          {/* BEFORE */}
          <div className="flex-1 bg-gray-50 p-8 lg:p-10">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Before EdMarg
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-700 mb-8">
              Unclear Direction
            </h3>
            <ul className="space-y-4">
              {BEFORE_LIST.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
                    <X className="h-3 w-3 text-gray-500" strokeWidth={3} />
                  </div>
                  <span className="text-base font-medium text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-gray-300">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Feeling: overwhelmed and stuck
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center bg-white px-4 py-6 lg:w-20 lg:px-0 lg:py-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 bg-gray-100">
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          {/* AFTER */}
          <div className="flex-1 bg-blue-50 p-8 lg:p-10">
            <div className="mb-8">
              <span className="inline-block px-3 py-1 bg-white border border-blue-300 rounded-lg text-xs font-semibold text-blue-600 uppercase tracking-wide">
                After EdMarg
              </span>
            </div>
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
              Clear Career Plan
            </h3>
            <ul className="space-y-4">
              {AFTER_LIST.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-base font-semibold text-gray-900">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-6 border-t border-blue-300">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Feeling: empowered and focused
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransformSection;
