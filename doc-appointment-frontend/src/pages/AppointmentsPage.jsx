import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Eye, Edit2, Trash2, X, AlertCircle, Loader2, CheckCircle, Clock as ClockIcon, User, Stethoscope, FileText, Phone, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
    patientName: '',
    patientPhone: '',
    patientEmail: ''
  });

  // Status badge component
  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmed' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X, label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/admin/appointments');
      const data = await response.json();
      if (data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch appointments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8080/admin/doctors');
      const data = await response.json();
      if (data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch doctors', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        doctor_id: parseInt(formData.doctorId),
        appointment_date: `${formData.appointmentDate} ${formData.appointmentTime}:00`,
        symptoms: formData.reason,
        status: 'pending',
        patient_name: formData.patientName,
        patient_phone: formData.patientPhone,
        patient_email: formData.patientEmail,
        notes: formData.notes
      };

      const url = editingId 
        ? `http://localhost:8080/admin/appointments/${editingId}`
        : 'http://localhost:8080/admin/appointments';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        resetForm();
        fetchAppointments();
        alert(editingId ? 'Appointment updated successfully!' : 'Appointment booked successfully!');
      } else {
        const error = await response.json();
        setError(error.error || 'Failed to save appointment');
      }
    } catch (err) {
      setError('Failed to save appointment');
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await fetch(`http://localhost:8080/admin/appointments/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          fetchAppointments();
          alert('Appointment cancelled successfully');
        } else {
          setError('Failed to cancel appointment');
        }
      } catch (err) {
        setError('Failed to cancel appointment');
      }
    }
  };

  // Handle edit
  const handleEdit = (appointment) => {
    const dateTime = appointment.appointment_date.split(' ');
    setFormData({
      doctorId: appointment.doctor_id.toString(),
      appointmentDate: dateTime[0],
      appointmentTime: dateTime[1]?.slice(0, 5) || '',
      reason: appointment.symptoms,
      notes: appointment.notes || '',
      patientName: appointment.patient_name,
      patientPhone: appointment.patient_phone || '',
      patientEmail: appointment.patient_email || ''
    });
    setEditingId(appointment.id);
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: '',
      patientName: '',
      patientPhone: '',
      patientEmail: ''
    });
    setEditingId(null);
    setShowModal(false);
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(app => {
    const matchesSearch = app.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.symptoms?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const viewingAppointment = viewingId ? appointments.find(a => a.id === viewingId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-10 w-10 text-indigo-600" />
              অ্যাপয়েন্টমেন্ট ম্যানেজমেন্ট
            </h1>
            <p className="text-slate-600 mt-2">ডাক্তার অ্যাপয়েন্টমেন্ট বুক ও ম্যানেজ করুন</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            নতুন অ্যাপয়েন্টমেন্ট
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex justify-between items-center">
            <p className="text-red-800 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              {error}
            </p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">মোট অ্যাপয়েন্টমেন্ট</p>
                <p className="text-2xl font-bold text-slate-900">{appointments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Pending</p>
                <p className="text-2xl font-bold text-slate-900">
                  {appointments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Confirmed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {appointments.filter(a => a.status === 'confirmed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Completed</p>
                <p className="text-2xl font-bold text-slate-900">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient, doctor, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-slate-600">Loading appointments...</span>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No appointments found</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  Book your first appointment
                </button>
              </div>
              
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((appointment) => (
                
                <div key={appointment.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 rounded-lg shadow-md">
                          <Stethoscope className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-slate-900">{appointment.doctor_name}</h3>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                              {appointment.specialization}
                            </span>
                          </div>
                          <p className="text-slate-700 mt-2 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            {appointment.symptoms}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full">
                              <Calendar className="h-4 w-4 text-indigo-500" />
                              {new Date(appointment.appointment_date).toLocaleDateString('bn-BD', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full">
                              <Clock className="h-4 w-4 text-indigo-500" />
                              {appointment.appointment_date.split(' ')[1]?.slice(0, 5)}
                            </div>
                            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-full">
                              <User className="h-4 w-4 text-indigo-500" />
                              {appointment.patient_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(appointment.status)}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setViewingId(appointment.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(appointment.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Cancel"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
              ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'অ্যাপয়েন্টমেন্ট আপডেট করুন' : 'নতুন অ্যাপয়েন্টমেন্ট বুক করুন'}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-indigo-800 p-1 rounded-lg transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">রোগীর নাম *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="রোগীর পুরো নাম"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">মোবাইল নম্বর *</label>
                  <input
                    type="tel"
                    value={formData.patientPhone}
                    onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="০১XXXXXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">ইমেইল</label>
                <input
                  type="email"
                  value={formData.patientEmail}
                  onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="patient@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">ডাক্তার নির্বাচন করুন *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">ডাক্তার নির্বাচন করুন</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.username} - {doctor.specialization} (৳{doctor.consultation_fee})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">তারিখ *</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">সময় *</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">লক্ষণ/কারণ *</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                  placeholder="যেমন: জ্বর, মাথাব্যথা, নিয়মিত চেকআপ"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">অতিরিক্ত তথ্য</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ডাক্তারকে জানানোর মতো বিশেষ কোনো তথ্য"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
                >
                  {editingId ? 'আপডেট করুন' : 'বুক করুন'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
                >
                  বাতিল করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">অ্যাপয়েন্টমেন্টের বিবরণ</h2>
              <button onClick={() => setViewingId(null)} className="text-white hover:bg-blue-800 p-1 rounded-lg transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Stethoscope className="h-8 w-8 text-indigo-600" />
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{viewingAppointment.doctor_name}</h3>
                    <p className="text-slate-600">{viewingAppointment.specialization}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-slate-600" />
                    <span className="font-semibold">Consultation Fee: ৳{viewingAppointment.consultation_fee}</span>
                  </div>
                  {getStatusBadge(viewingAppointment.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2 mb-2">
                    <User className="h-4 w-4" /> রোগীর তথ্য
                  </h3>
                  <p className="font-semibold text-slate-900">{viewingAppointment.patient_name}</p>
                  {viewingAppointment.patient_phone && (
                    <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                      <Phone className="h-3 w-3" /> {viewingAppointment.patient_phone}
                    </p>
                  )}
                  {viewingAppointment.patient_email && (
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" /> {viewingAppointment.patient_email}
                    </p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" /> সময় ও তারিখ
                  </h3>
                  <p className="font-semibold text-slate-900">
                    {new Date(viewingAppointment.appointment_date).toLocaleDateString('bn-BD', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" /> {viewingAppointment.appointment_date.split(' ')[1]?.slice(0, 5)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" /> লক্ষণ/কারণ
                </h3>
                <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{viewingAppointment.symptoms}</p>
              </div>

              {viewingAppointment.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">অতিরিক্ত তথ্য</h3>
                  <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">{viewingAppointment.notes}</p>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500">বুকিং তারিখ: {new Date(viewingAppointment.created_at).toLocaleString()}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setViewingId(null)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  বন্ধ করুন
                </button>
                {viewingAppointment.status !== 'completed' && viewingAppointment.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setViewingId(null);
                      handleEdit(viewingAppointment);
                    }}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                    এডিট করুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;