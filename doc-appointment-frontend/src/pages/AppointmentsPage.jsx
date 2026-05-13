import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Plus, Edit2, Trash2, Eye, Loader2, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AppointmentsPage.css';

// Demo data
const DEMO_APPOINTMENTS = [
  {
    id: 1,
    patientName: 'Ahmed Hassan',
    patientEmail: 'patient@example.com',
    doctorName: 'Dr. Smith',
    doctorSpecialization: 'Cardiology',
    appointmentDate: '2026-05-20',
    appointmentTime: '10:00',
    reason: 'Heart Check-up',
    status: 'confirmed',
    notes: 'Regular check-up',
    createdAt: new Date().toLocaleDateString(),
  },
  {
    id: 2,
    patientName: 'Ahmed Hassan',
    patientEmail: 'patient@example.com',
    doctorName: 'Dr. Rahman',
    doctorSpecialization: 'Dermatology',
    appointmentDate: '2026-05-25',
    appointmentTime: '14:30',
    reason: 'Skin consultation',
    status: 'pending',
    notes: 'Follow-up consultation',
    createdAt: new Date().toLocaleDateString(),
  },
];

const DEMO_DOCTORS = [
  { id: 1, username: 'Dr. Smith', specialization: 'Cardiology' },
  { id: 2, username: 'Dr. Rahman', specialization: 'Dermatology' },
  { id: 3, username: 'Dr. Khan', specialization: 'Neurology' },
  { id: 4, username: 'Dr. Ahmed', specialization: 'Pediatrics' },
];

const AppointmentsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [viewingId, setViewingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    notes: '',
  });

  useEffect(() => {
    // Check if user is authenticated
    if (!user.isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/appointments' } } });
      return;
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setAppointments([...DEMO_APPOINTMENTS]);
      setDoctors([...DEMO_DOCTORS]);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [user.isAuthenticated]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const selectedDoctor = doctors.find(d => d.id === parseInt(formData.doctorId));

      if (editingId) {
        // Update appointment
        setAppointments(appointments.map(a =>
          a.id === editingId
            ? {
                ...a,
                doctorId: formData.doctorId,
                doctorName: selectedDoctor.username,
                doctorSpecialization: selectedDoctor.specialization,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formData.appointmentTime,
                reason: formData.reason,
                notes: formData.notes,
              }
            : a
        ));
      } else {
        // Create appointment
        const newAppointment = {
          id: Math.max(0, ...appointments.map(a => a.id)) + 1,
          patientName: user.name,
          patientEmail: user.email,
          doctorId: formData.doctorId,
          doctorName: selectedDoctor.username,
          doctorSpecialization: selectedDoctor.specialization,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason,
          notes: formData.notes,
          status: 'pending',
          createdAt: new Date().toLocaleDateString(),
        };
        setAppointments([...appointments, newAppointment]);
      }

      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save appointment');
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      doctorId: appointment.doctorId || '',
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      reason: appointment.reason,
      notes: appointment.notes,
    });
    setEditingId(appointment.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      doctorId: '',
      appointmentDate: '',
      appointmentTime: '',
      reason: '',
      notes: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredAppointments = appointments.filter(a => {
    const matchesSearch = 
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const viewingAppointment = appointments.find(a => a.id === viewingId);

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmed' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
      completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="h-10 w-10 text-indigo-600" />
              অ্যাপয়েন্টমেন্ট
            </h1>
            <p className="text-slate-600 mt-2">Book and manage your doctor appointments (Demo Data)</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
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

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by patient, doctor, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
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
          <>
            {/* Appointments Grid */}
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
                filteredAppointments.map((appointment) => (
                  <div key={appointment.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-indigo-100 p-3 rounded-lg">
                            <Calendar className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-slate-900">{appointment.doctorName}</h3>
                            <p className="text-sm text-slate-500">{appointment.doctorSpecialization}</p>
                            <p className="text-slate-700 font-medium mt-1">{appointment.reason}</p>

                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {new Date(appointment.appointmentDate).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {appointment.appointmentTime}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(appointment.status)}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setViewingId(appointment.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {appointment.status !== 'completed' && (
                            <>
                              <button
                                onClick={() => handleEdit(appointment)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(appointment.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Book Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Appointment' : 'বুক করুন অ্যাপয়েন্টমেন্ট'}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-indigo-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Select Doctor *</label>
                <select
                  value={formData.doctorId}
                  onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.username} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Appointment Date *</label>
                  <input
                    type="date"
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Appointment Time *</label>
                  <input
                    type="time"
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Reason for Visit</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Regular Check-up"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information for the doctor"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {editingId ? 'Update Appointment' : 'Book Appointment'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-200 text-slate-900 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Appointment Details</h2>
              <button onClick={() => setViewingId(null)} className="text-white hover:bg-blue-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Doctor</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingAppointment.doctorName}</p>
                  <p className="text-sm text-slate-600">{viewingAppointment.doctorSpecialization}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Status</h3>
                  {getStatusBadge(viewingAppointment.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Date
                  </h3>
                  <p className="text-lg font-semibold text-slate-900">
                    {new Date(viewingAppointment.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Time
                  </h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingAppointment.appointmentTime}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Reason for Visit</h3>
                <p className="text-slate-900">{viewingAppointment.reason}</p>
              </div>

              {viewingAppointment.notes && (
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Notes</h3>
                  <p className="text-slate-900">{viewingAppointment.notes}</p>
                </div>
              )}

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-500">Booked on: {viewingAppointment.createdAt}</p>
              </div>

              <button
                onClick={() => setViewingId(null)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-6"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
