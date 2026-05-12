import React from 'react';
import { Star, Clock, DollarSign, Award, Calendar } from 'lucide-react';

const DoctorCard = ({ doctor }) => {
  const defaultImage = "https://ui-avatars.com/api/?name=" + doctor.username + "&background=3b82f6&color=fff&size=200&bold=true";

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group overflow-hidden">
      {/* Top Gradient Section */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            <img
              src={defaultImage}
              alt={doctor.username}
              className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-2 right-2 bg-green-500 w-5 h-5 rounded-full border-2 border-white animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-20 pb-6 px-6">
        {/* Doctor Name and Specialization */}
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
            ডা. {doctor.username}
          </h3>
          <div className="inline-flex items-center space-x-2 mt-2 px-3 py-1 bg-blue-50 rounded-full">
            <Award className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">{doctor.specialization}</span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-xl text-center">
            <Clock className="h-5 w-5 text-amber-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-amber-700">{doctor.experience_years}+</p>
            <p className="text-xs text-amber-600">বছরের অভিজ্ঞতা</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center">
            <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <p className="text-sm font-bold text-green-700">৳{doctor.consultation_fee}</p>
            <p className="text-xs text-green-600">পরামর্শ ফি</p>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className="h-5 w-5 text-yellow-400 fill-current"
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600">(৫.০)</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>অ্যাপয়েন্টমেন্ট নিন</span>
          </button>
          <button className="w-full py-2 border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all duration-300">
            বিস্তারিত দেখুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;