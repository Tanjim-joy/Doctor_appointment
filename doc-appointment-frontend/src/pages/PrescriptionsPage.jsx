import React from 'react';

const PrescriptionsPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">প্রেসক্রিপশন</h1>
        <p className="mt-3 text-slate-600">
          শুধুমাত্র অ্যাডমিন এবং ডাক্তারই এই পাতা দেখতে পারবেন। যদি আপনি লগইন না করে আসেন, তাহলে আপনাকে মূল পৃষ্ঠায় নিয়ে যাওয়া হবে।
        </p>
      </div>
    </div>
  );
};

export default PrescriptionsPage;
