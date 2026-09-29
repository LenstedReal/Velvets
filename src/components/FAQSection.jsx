'use client';
import React, { useState } from 'react';
import { faqData } from '../data/mockData';
import { ChevronDown, Sparkles } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-16 bg-[#050507]">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm mb-4">
            <Sparkles className="w-4 h-4" /> All Features FREE
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-white/60">
            Everything you need to know about VelvetAI
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => (
            <div key={index} className="rounded-2xl border border-white/10 overflow-hidden bg-white/5 hover:bg-white/[0.07] transition-colors">
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium pr-4">{item.question}</span>
                <ChevronDown className={`w-5 h-5 text-pink-400 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                <div className="px-5 pb-5">
                  <p className="text-white/60 leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <p className="text-white/50 mb-4">Still have questions?</p>
          <a href="mailto:contact@velvetai.com" className="text-pink-400 hover:text-pink-300 font-medium">
            Contact Support →
          </a>
        </div>

        <p className="text-white/30 text-xs text-center mt-8">Made with ❤️ by <span className="text-pink-400">LenstedReal</span></p>
      </div>
    </section>
  );
};

export default FAQSection;
