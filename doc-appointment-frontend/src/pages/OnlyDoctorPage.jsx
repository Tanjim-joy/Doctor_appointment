import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DoctorCard from '../components/doctors/DoctorCard';
import { Search, Filter, Loader2, SlidersHorizontal, X } from 'lucide-react';

const OnlyDoctorPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const specializations = ['সকল', 'Cardiology', 'Dermatology', 'Neurology', 'Pediatrics'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedSpecialization, doctors]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      // API কল (আপনার ব্যাকএন্ড URL দিন)
      const response = await axios.get('http://localhost:8080/api/doctors');
      
      // console.log("Full response:", response);
      // console.log("response.data type:", typeof response.data);
      // console.log("response.data structure:", JSON.stringify(response.data, null, 2));
      
      // Handle both array and nested data structures
      let doctorData = [];
      if (Array.isArray(response.data)) {
        doctorData = response.data;
      } else if (response.data?.doctors) {
        doctorData = response.data.doctors;
      } else if (response.data?.data) {
        doctorData = response.data.data;
      } else if (typeof response.data === 'object') {
        // Try to find any array in the response
        const firstArrayValue = Object.values(response.data).find(val => Array.isArray(val));
        doctorData = firstArrayValue || [];
      }
      
      console.log("Extracted doctorData:", doctorData);
      // console.log("doctorData length:", doctorData.length);

      setDoctors(doctorData);
      setFilteredDoctors(doctorData);
      setLoading(false);
    } catch (err) {
      console.log("API Error, using demo data");
      // For Demo data Use
      const demoData = [
        {
          id: 1,
          username: "Smith",
          specialization: "Cardiology",
          experience_years: 10,
          consultation_fee: 1500
        },
        {
          id: 2,
          username: "Rahman",
          specialization: "Dermatology",
          experience_years: 7,
          consultation_fee: 1000
        },
        {
          id: 3,
          username: "Khan",
          specialization: "Neurology",
          experience_years: 15,
          consultation_fee: 2000
        },
        {
          id: 4,
          username: "Ahmed",
          specialization: "Pediatrics",
          experience_years: 5,
          consultation_fee: 800
        },
        {
          id: 5,
          username: "Hasan",
          specialization: "Cardiology",
          experience_years: 12,
          consultation_fee: 1800
        }
      ];
      setDoctors(demoData);
      setFilteredDoctors(demoData);
      setLoading(false);
    }
  };

  const filterDoctors = () => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialization && selectedSpecialization !== 'সকল') {
      filtered = filtered.filter(doctor =>
        doctor.specialization === selectedSpecialization
      );
    }

    setFilteredDoctors(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-1 py-4 sm:px-6 lg:px-8">
          <div className="text-center">           
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ডাক্তারের নাম বা স্পেশালাইজেশন সার্চ করুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-3 pr-12 rounded-2xl text-gray-800 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-blue-400" />
                
              </div>
              <p className="mx-auto mt-2  text-sm ">
                  অভিজ্ঞতা এবং সেবা নিয়ে আত্মবিশ্বাসের সাথে রোগীদের সমাধান করার এক আধুনিক মেডিক্যাল স্পেশালিস্ট।
                </p>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="mt-4 inline-flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all duration-300"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>ফিল্টার</span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 flex flex-wrap justify-center gap-3 animate-fadeIn">
              {specializations.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSelectedSpecialization(spec === selectedSpecialization ? '' : spec)}
                  className={`px-5 py-2 rounded-full transition-all duration-300 font-medium ${
                    selectedSpecialization === spec
                      ? 'bg-white text-blue-600 shadow-lg transform scale-105'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {spec}
                  {selectedSpecialization === spec && (
                    <X className="inline-block ml-2 h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 text-lg">ডাক্তারদের তথ্য লোড হচ্ছে...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <button 
              onClick={fetchDoctors}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-xl">কোন ডাক্তার পাওয়া যায়নি</p>
            <p className="text-gray-500 mt-2">অনুগ্রহ করে ভিন্ন কিওয়ার্ড বা ফিল্টার ব্যবহার করুন</p>
          </div>
        ) : (
          <>
            {/* <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {filteredDoctors.length} জন ডাক্তার পাওয়া গেছে
              </h2>
            </div> */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OnlyDoctorPage;