import React from 'react';
import { Star, Clock, DollarSign, Calendar, MapPin, GraduationCap, FileText, Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const DoctorCard = ({ doctor }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [showDoctorModal, setShowDoctorModal] = React.useState(false);

  // console.log(doctor);

  const getQualifications = () => {
    if(!doctor.qualification || doctor.qualification.length === 0) {
      return ['MBBS - ঢাকা মেডিকেল কলেজ'];
    } 
    if (Array.isArray(doctor.qualification)) {
      return doctor.qualification.map(q => q.trim().replace(/['"]/g, '')).filter(q => q.length > 0);
    } 
    return doctor.qualification
      .split(',')
      .map(q => q.trim().replace(/['"]/g, ''))
      .filter(q => q.length > 0);
  };

  const qualifications = getQualifications();

  // console.log("Current user in DoctorCard:", doctor);

  const defaultImage =
    'https://ui-avatars.com/api/?name=' +
    encodeURIComponent(doctor.username || 'Doctor') +
    '&background=3b82f6&color=fff&size=200&bold=true';

  const handleBookClick = () => {
    if (user.isAuthenticated) {
      // User is logged in, show booking modal
      setShowBookingModal(true);
    } else {
      // User is not logged in, redirect to login page
      navigate('/login');
    }
  };

  return (
    <div className="group relative h-full">
      {/* Card Container */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
        {/* Top Gradient Banner */}
        <div className="relative h-32 bg-linear-to-br from-sky-400 via-blue-500 to-indigo-600">
          {/* Decorative Elements */}
          <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-50" />
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-4 -bottom-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />
          
          {/* Online Badge */}
          <div className="absolute right-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Available
            </span>
          </div>

          {/* Premium Badge */}
          {/* <div className="absolute left-4 top-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <Award className="h-3.5 w-3.5" />
              প্রিমিয়ার
            </span>
          </div> */}

          {/* Favorite Button */}
          {/* <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="absolute right-4 top-16 rounded-full bg-white/20 p-2 backdrop-blur-sm transition-all hover:bg-white/30"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isFavorite ? 'fill-red-500 text-red-500' : 'text-white'
              }`}
            />
          </button> */}
        </div>

        {/* Doctor Image - Overlapping */}
        <div className="relative -mt-16 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-sky-400 to-indigo-600 blur-md transform scale-110 opacity-0 group-hover:opacity-70 transition-opacity duration-500"></div>
            <img
              src={doctor.image || defaultImage}
              alt={doctor.username}
              className="relative h-28 w-28 rounded-full border-4 border-white object-cover shadow-xl transition-transform duration-500 group-hover:scale-105"
            />
            {/* Verification Badge */}
            <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 border-2 border-white shadow-lg">
              <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1 px-6 pt-4 pb-0">
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600">
              ডা. {doctor.username}
            </h3>
            <div className="mt-1 flex items-center justify-center gap-1">
              <GraduationCap className="h-4 w-4 text-slate-400" />
              <p className="text-sm font-medium text-sky-600">{doctor.specialization}</p>
            </div>
          </div>

          {/* Location */}
          {doctor.location && (
            <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span>{doctor.location}</span>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="flex flex-col items-center rounded-2xl bg-linear-to-br from-sky-50 to-blue-50 p-3 transition-transform hover:scale-105">
              <Clock className="h-5 w-5 text-sky-600" />
              <p className="mt-1.5 text-lg font-bold text-slate-900">{doctor.experience_years}+</p>
              <p className="text-xs text-slate-600">বছর</p>
            </div>
            <div className="flex flex-col items-center rounded-2xl bg-linear-to-br from-amber-50 to-orange-50 p-3 transition-transform hover:scale-105">
              <DollarSign className="h-5 w-5 text-amber-600" />
              <p className="mt-1.5 text-lg font-bold text-slate-900">৳{doctor.consultation_fee}</p>
              <p className="text-xs text-slate-600">ফি</p>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  className={`h-4 w-4 ${
                    index < 5 ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-slate-700">5.0</span>
            <span className="text-xs text-slate-400">(120)</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex gap-3 px-6 pb-6">
          <button 
            onClick={handleBookClick}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all duration-300 hover:shadow-sky-500/50 hover:scale-105 active:scale-95"
          >
            <Calendar className="h-4 w-4" />
            <span>বুক করুন</span>
          </button>
          <button 
            onClick={() => setShowDoctorModal(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">
            প্রোফাইল
          </button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">অ্যাপয়েন্টমেন্ট বুক করুন</h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="rounded-full p-1 hover:bg-slate-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Doctor Info in Modal */}
            <div className="mb-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <img
                  src={doctor.image || defaultImage}
                  alt={doctor.username}
                  className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-md"
                />
                <div>
                  <h4 className="font-semibold text-slate-900">ডা. {doctor.username}</h4>
                  <p className="text-sm text-sky-600">{doctor.specialization}</p>
                  <p className="text-sm text-slate-500">৳{doctor.consultation_fee} - ফি</p>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  অ্যাপয়েন্টমেন্ট তারিখ এবং সময়
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  সমস্যার বিবরণ
                </label>
                <textarea
                  rows={3}
                  placeholder="আপনার সমস্যা বর্ণনা করুন..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-sky-600 py-2 text-sm font-medium text-white hover:bg-sky-700"
                >
                  কনফার্ম করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
{showDoctorModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Overlay */}
    <div 
      className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-md"
      onClick={() => setShowDoctorModal(false)}
    />
    
    {/* Modal Container */}
    <div className="relative w-full max-w-lg animate-modalSlideIn overflow-hidden rounded-3xl bg-white shadow-2xl">
      {/* Header with Gradient */}
      <div className="relative bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 px-8 pt-8 pb-16">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-white blur-3xl" />
          <div className="absolute right-20 top-0 h-20 w-20 rounded-full bg-white blur-2xl" />
        </div>

        {/* Close Button */}
        <button
          onClick={() => setShowDoctorModal(false)}
          className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:rotate-90"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Content */}
        <div className="relative text-center">
          <h2 className="text-2xl font-bold text-white">ডাক্তারের বিস্তারিত</h2>
          <p className="mt-1 text-sm text-white/80">সম্পূর্ণ তথ্য দেখুন</p>
        </div>
      </div>

      {/* Doctor Image - Overlapping */}
      <div className="relative -mt-12 flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 blur-lg opacity-50" />
          <img
            src={doctor.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.username)}&background=3b82f6&color=fff&size=150&bold=true`}
            alt={doctor.username}
            className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-xl"
          />
          {/* Online Status */}
          <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
            <span className="block h-2.5 w-2.5 rounded-full bg-white" />
          </span>
        </div>
      </div>

      {/* Doctor Name & Specialization */}
      <div className="mt-4 text-center">
        <h3 className="text-xl font-bold text-slate-900">ডা. {doctor.username}</h3>
        <div className="mt-1 flex items-center justify-center gap-1">
          <Award className="h-4 w-4 text-sky-600" />
          <p className="text-sm font-medium text-sky-600">{doctor.specialization}</p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 px-6">
        {/* Experience */}
        <div className="group rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 p-4 transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-2 text-white shadow-lg">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">অভিজ্ঞতা</p>
              <p className="text-lg font-bold text-slate-900">{doctor.experience_years} বছর</p>
            </div>
          </div>
        </div>

        {/* Fee */}
        <div className="group rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4 transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2 text-white shadow-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">পরামর্শ ফি</p>
              <p className="text-lg font-bold text-slate-900">৳{doctor.consultation_fee}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        {/* <div className="group rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-4 transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 p-2 text-white shadow-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">অবস্থান</p>
              <p className="text-sm font-bold text-slate-900">{doctor.location || 'N/A'}</p>
            </div>
          </div>
        </div> */}

        {/* Rating */}
        {/* <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 transition-all hover:scale-105 hover:shadow-lg">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2 text-white shadow-lg">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">রেটিং</p>
              <div className="flex items-center gap-1">
                <p className="text-lg font-bold text-slate-900">4.8</p>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </div>
        </div> */}
      </div>

      {/* Education/Qualifications */}
      <div className="mt-3 px-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="h-5 w-5 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">শিক্ষাগত যোগ্যতা</h4>
          </div>
          <div className="space-y-2">
            {qualifications.map((qualification, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <p className="text-sm text-slate-600">{qualification}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bio Section */}
      <div className="mt-4 px-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">জীবন বৃত্তান্ত</h4>
          </div>
          <p className="text-sm leading-relaxed text-slate-600">
            {doctor.bio || 'একজন অভিজ্ঞ ও দক্ষ চিকিৎসক, যিনি রোগীদের সুস্বাস্থ্য নিশ্চিত করতে সর্বদা নিবেদিত। আধুনিক চিকিৎসা পদ্ধতিতে প্রশিক্ষিত এবং রোগীদের সাথে বন্ধুত্বপূর্ণ আচরণ করে থাকেন।'}
          </p>
        </div>
      </div>

      

      {/* Available Slots */}
      {/* <div className="mt-3 px-6">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-slate-600" />
            <h4 className="text-sm font-semibold text-slate-700">আজকের সিরিয়াল</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {['১০:০০ AM', '১১:৩০ AM', '০২:০০ PM', '০৪:৩০ PM', '০৬:০০ PM'].map((time, index) => (
              <span
                key={index}
                className="rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-50 hover:border-sky-300 cursor-pointer transition-all"
              >
                {time}
              </span>
            ))}
          </div>
        </div>
      </div> */}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3 px-6 pb-6">
        {/* <button
          className="flex-1 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:shadow-sky-500/50 hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5" />
            <span>অ্যাপয়েন্টমেন্ট বুক করুন</span>
          </div>
        </button> */}
        {/* <button
          onClick={() => setShowDoctorModal(false)}
          className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
        >
          বন্ধ করুন
        </button> */}
      </div>
    </div>
  </div>
)}

{/* Add this CSS animation */}
<style>{`
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  .animate-modalSlideIn {
    animation: modalSlideIn 0.3s ease-out;
  }
`}</style>
    </div>
  );
};

export default DoctorCard;


