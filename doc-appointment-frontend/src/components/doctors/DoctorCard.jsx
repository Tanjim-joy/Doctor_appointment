import React from 'react';
import { Star, Clock, DollarSign, Award, Calendar } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  const defaultImage =
    'https://ui-avatars.com/api/?name=' +
    encodeURIComponent(doctor.username || 'Doctor') +
    '&background=3b82f6&color=fff&size=200&bold=true';

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/95 shadow-[0_28px_80px_rgba(15,23,42,0.12)] transition-transform duration-500 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(15,23,42,0.18)]">
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600" />
      <div className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-16 top-16 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

      <div className="relative px-6 pt-6 pb-8">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 shadow-sm">
            <Award className="h-3.5 w-3.5 text-sky-700" />
            প্রিমিয়ার
          </span>
          <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-600">
            লাইভ অন
          </span>
        </div>

        <div className="relative mt-6 text-center">
          <div className="absolute left-1/2 top-0 -translate-x-1/2">
            <div className="relative">
              <img
                src={defaultImage}
                alt={doctor.username}
                className="h-28 w-28 rounded-full border-4 border-white bg-slate-100 object-cover shadow-2xl"
              />
              <span className="absolute bottom-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 border-2 border-white shadow-sm">
                <span className="block h-2.5 w-2.5 rounded-full bg-white" />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-34 text-center">
          <h3 className="text-2xl font-semibold text-slate-900 ">
            ডা. {doctor.username}
          </h3>
          <p className="mt-3 text-sm font-medium uppercase tracking-[0.18em] text-sky-600">
            {doctor.specialization}
          </p>          
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 text-center shadow-sm">
            <Clock className="mx-auto h-5 w-5 text-slate-700" />
            <p className="mt-2 text-lg font-semibold text-slate-900">{doctor.experience_years}+</p>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">বছরের অভিজ্ঞতা</p>
          </div>
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-4 text-center shadow-sm">
            <DollarSign className="mx-auto h-5 w-5 text-slate-700" />
            <p className="mt-2 text-lg font-semibold text-slate-900">৳{doctor.consultation_fee}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-slate-500">পরামর্শ ফি</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2">
            {[...Array(5)].map((_, index) => (
              <Star key={index} className="h-4 w-4 text-amber-400" />
            ))}
          </div>
          <span className="font-medium text-slate-700">5.0</span>
        </div>

        <div className="mt-6 grid gap-3">
          <button className="flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition duration-300 hover:scale-[1.01]">
            <Calendar className="h-5 w-5" />
            <span>অ্যাপয়েন্টমেন্ট বুক করুন</span>
          </button>
          <button className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition duration-300 hover:border-slate-300 hover:bg-slate-50">
            বিস্তারিত জানুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
