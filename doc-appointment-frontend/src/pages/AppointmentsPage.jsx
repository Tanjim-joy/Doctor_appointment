import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Eye, Edit2, Trash2, X, AlertCircle, Loader2, CheckCircle, Clock as ClockIcon, User, Stethoscope, FileText, Phone, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';


const AppointmentManagement = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);

  // Prescription modal + form state (for doctors)
  const [showPresModal, setShowPresModal] = useState(false);
  const [prescribingAppointment, setPrescribingAppointment] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    patientName: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',    
    patientPhone: '',
    diagnosis: '',
    bloodPressure: '',
    bloodGroup: '',
    appointmentId: null,
    appointmentDate: '',
    medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
    instructions: '',
    followUp: '',
  });
  const [presLoading, setPresLoading] = useState(false);
  const [presError, setPresError] = useState('');

  // console.log(user);


  const [formData, setFormData] = useState({
    doctor_id: '',
    patient_id: '',    
    appointment_date: '',
    appointment_time: '',
    symptoms: '',
    remarks: '',    
    ref_name: '',
    ref_phone: '',
    age: '',
    status: 'pending'
  });

  // console.log('Form Data:', formData);

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
      setError(null);

      var userid = user.id;
      let response = '';
      if (user.role === 'doctor'|| user.role === 'patient') {
        response = await fetch(`http://localhost:8080/appointments/user/${userid}`);
      }else{
        response = await fetch('http://localhost:8080/admin/appointments');
      }
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

  // Fetch doctors userid wise
  const fetchDoctors = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/doctors');
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
      const patientId = user.role === 'patient'
        ? user.patient_id
        : Number(formData.patient_id);


      if (!patientId) {
        setError('Please select a valid patient');
        return;
      }
      // const refPhn = formData.ref_phone?.Valid ? formData.ref_phone.String : '';
      // console.log('Submitting Ref Phone:', refPhn);
      
      const appointmentData = {
        patient_id: patientId,
        doctor_id: parseInt(formData.doctor_id),
        appointment_date: `${formData.appointment_date} ${formData.appointment_time}:00`,
        symptoms: formData.symptoms,
        status: editingId ? formData.status : 'pending',
        ref_name: formData.ref_name,
        ref_phone: formData.ref_phone,
        age: formData.age,
        remarks: formData.remarks,
      };

      // console.log('Submitting patient_id:', patientId);
      // console.log('Submitting patient_id:', editingId);
      // console.log(typeof formData.age);

      const url = editingId 
        ? `http://localhost:8080/appointments/${editingId}`
        : 'http://localhost:8080/appointments';
      
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
    // console.log('Attempting to delete appointment with ID:', id);

    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        const response = await fetch(`http://localhost:8080/appointments/${id}`, {
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
  if (!appointment) return; 

  // console.log('Editing appointment:', appointment);

  // Helper to safely extract Go/SQL Nullable Strings
  const getSqlString = (field) => field?.Valid ? field.String : (typeof field === 'string' ? field : null);
  // Helper to safely extract Go/SQL Nullable Ints
  const getSqlInt = (field) => field?.Valid ? field.Int64 : (typeof field === 'number' ? field : null);

  // 1. Extract values safely using nullish coalescing (??)
  const refName = getSqlString(appointment.patient_name) ?? appointment.ref_name ?? '';
  const refPhn = getSqlString(appointment.ref_phone) ?? appointment.patient_phone ?? '00';
  const age = getSqlInt(appointment.age) ?? '';
  const rmk = getSqlString(appointment.remarks) ?? appointment.notes ?? 'No additional remarks';

  // console.log('Extracted values:', { refName, refPhn, age, rmk });

  // 2. Handle Date & Time safely
  // Assumes format "YYYY-MM-DD HH:mm:ss"
  const [dateStr = '', timeStr = ''] = appointment.appointment_date?.split(' ') || [];
  const appointment_time = timeStr ? timeStr.slice(0, 5) : ''; // HH:mm

  // 3. Update State
  setFormData({
    patient_id: appointment.patient_id?.toString() ?? '',
    doctor_id: appointment.doctor_id?.toString() ?? '',
    appointment_date: dateStr,
    appointment_time: appointment_time,
    symptoms: appointment.symptoms ?? '',
    remarks: rmk,
    ref_name: refName,
    ref_phone: refPhn,
    age: age.toString() || '00', // Keeps 0 as "0", defaults empty to "00"
    status: appointment.status ?? 'pending'
  });

    setEditingId(appointment.id);
    setShowModal(true);
  };

  // Open prescribe modal (doctors only)
  const handleOpenPrescribe = (appointment) => {
      setShowModal(false); // Close main form modal if open
      setPrescribingAppointment(appointment); // Store the appointment for which we're prescribing
      // console.log('Prescribing for appointment:', appointment);
      setPrescriptionData({
      patientName: appointment.patient_name || appointment.ref_name || '',
      patientEmail: appointment.patient_email || appointment.patientEmail || '',
      patientAge: appointment?.age?.Int64 || '00',
      patientGender: appointment.Gender?.String || 'Not specified',      
      patientPhone: appointment?.patient_phone?.String || appointment?.ref_phone?.String || '',
      diagnosis: appointment.symptoms || '',
      bloodPressure: '',
      bloodGroup: appointment.blood_group?.String || '',
      appointmentId: appointment.id,
      appointmentDate: appointment.appointment_date || '',
      appointmentTime: appointment.appointment_date?.split(' ')[1]?.slice(0,5) || '',
      patient_id: appointment.patient_id || null,
      doctor_id: appointment.doctor_id || null,
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
      instructions: '',
      followUp: '',
    });
    // console.log('Initialized prescription data:', {...prescriptionData});
    setShowPresModal(true);
  };

  // Prescription form helpers (operate on prescriptionData)
  const addMedicine = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: [...(prev.medicines || []), { name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }]
    }));
  };

  const removeMedicine = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const updateMedicine = (index, field, value) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.map((m, i) => i === index ? { ...m, [field]: value } : m)
    }));
  };

  const resetPrescriptionForm = () => {
    setPrescriptionData({
      patientName: '',
      patientEmail: '',
      patientAge: '',
      patientGender: '',
      patientPhone: '',
      diagnosis: '',
      bloodPressure: '',
      appointmentId: null,
      appointmentDate: '',
      appointmentTime: '',
      patient_id: null,
      doctor_id: null,
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
      instructions: '',
      followUp: '',
    });
    setPrescribingAppointment(null);
    setPresError('');
    setShowPresModal(false);
  };

  const handlePrescribeSubmit = async (e) => {
    e.preventDefault();
    try {
      setPresLoading(true);
      setPresError('');

      const payload = {
        patient_name: prescriptionData.patientName,
        patient_email: prescriptionData.patientEmail,
        patient_age: prescriptionData.patientAge,
        patient_gender: prescriptionData.patientGender,
        patient_phone: prescriptionData.patientPhone,
        diagnosis: prescriptionData.diagnosis,
        patient_id: prescribingAppointment?.patient_id || (user.role === 'patient' ? user.patient_id : null),
        doctor_id: prescribingAppointment?.doctor_id || (user.role === 'doctor' ? user.id : null),
        blood_pressure: prescriptionData.bloodPressure,
        appointment_id: prescribingAppointment?.id || prescriptionData.appointmentId,
        appointment_date: prescriptionData.appointmentDate,
        medicines: JSON.stringify(prescriptionData.medicines),
        instructions: prescriptionData.instructions,
        follow_up: prescriptionData.followUp,
        doctor_name: user.name,
        doctor_reg_no: user.doctorRegNo || 'BMDC-12345',
        hospital_name: user.hospitalName || 'General Hospital',     
      };

      const res = await fetch('http://localhost:8080/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // After creating a prescription, mark the related appointment as completed
        try {
          const apptId = prescribingAppointment?.id || prescriptionData.appointmentId;
          if (apptId) {
            await fetch(`http://localhost:8080/appointments/${apptId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'completed' })
            });
          }
        } catch (err) {
          console.warn('Failed to update appointment status:', err);
        }

        resetPrescriptionForm();
        fetchAppointments();
        alert('Prescription created successfully');
      } else {
        const err = await res.json().catch(() => ({}));
        setPresError(err.error || 'Failed to create prescription');
      }
    } catch (err) {
      console.error(err);
      setPresError('Failed to create prescription');
    } finally {
      setPresLoading(false);
    }
  };

  // Reset form 
  const resetForm = () => {
    setFormData({
      doctor_id: '',
      patient_id: '',
      appointment_date: '',
      appointment_time: '',
      symptoms: '',
      remarks: '',
      ref_name: '',
      ref_phone: '',
      age: '',
      status: 'pending'
    });
    setEditingId(null);
    setError('');
    setShowModal(false);
  }
 
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
          {user.role === 'patient' ? (
            <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg"
          >
            <Plus className="h-5 w-5" />
            নতুন অ্যাপয়েন্টমেন্ট
          </button>) : null }          
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
            {/* <option value="completed">Completed</option> */}
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
                        {appointment.status !== 'completed' && appointment.status !== 'cancelled' && user.role === 'doctor' && (
                          <>
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            {user.role === 'doctor' && (
                              <button
                                onClick={() => handleOpenPrescribe(appointment)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Prescribe"
                              >
                                <FileText className="h-4 w-4" />
                              </button>
                            )}
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
                {/* {user.role !== 'patient' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-900 mb-2">রোগী নির্বাচন করুন *</label>
                    <select
                      value={formData.patient_id}
                      onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">রোগী নির্বাচন করুন</option>
                      {patients.map(patient => {
                        const id = patient.patient_id || patient.id || patient.user_id;
                        const label = patient.name || patient.full_name || patient.username || `Patient ${id}`;
                        return (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        );
                      })}
                      {patients.length === 0 && formData.patient_id && (
                        <option value={formData.patient_id}>
                          {formData.ref_name || `Patient ${formData.patient_id}`}
                        </option>
                      )}
                    </select>
                  </div>
                )} */}

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">রোগীর নাম *</label>
                  <input
                    type="text"
                    value={formData.ref_name}
                    onChange={(e) => setFormData({ ...formData, ref_name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="রোগীর পুরো নাম"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">বয়স </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value === "" ? "" : Number(e.target.value), })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  value={formData.ref_phone}
                  onChange={(e) => setFormData({ ...formData, ref_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="০১XXXXXXXXX"
                />
              </div>

              <div className={user.role === 'doctor' ? 'hidden' : ''}>
                <label className="block text-sm font-medium text-slate-900 mb-2">ডাক্তার নির্বাচন করুন *</label>
                <select                  
                  value={formData.doctor_id || ''}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 "
                >
                  <option value="">ডাক্তার নির্বাচন করুন</option>
                  {doctors.map(doctor => (
                    <option key={doctor.doctor_id} value={doctor.doctor_id}>
                      {doctor.username} - {doctor.specialization} (৳{doctor.consultation_fee})
                    </option>
                  ))}
                </select>
              </div>

              {editingId && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">স্ট্যাটাস</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">তারিখ *</label>
                  <input
                    type="date"
                    value={formData.appointment_date}
                    onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                    required
                    
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">সময় *</label>
                  <input
                    type="time"
                    value={formData.appointment_time}
                    onChange={(e) => setFormData({ ...formData, appointment_time: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">লক্ষণ/কারণ *</label>
                <input
                  type="text"
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  required
                  placeholder="যেমন: জ্বর, মাথাব্যথা, নিয়মিত চেকআপ"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">অতিরিক্ত তথ্য</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
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

      {/* Prescription Modal (doctors) */}
      {showPresModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Prescription' : prescribingAppointment ? 'Prescribe for Appointment' : 'Create New Prescription'}
                </h2>
                <p className="text-sm text-indigo-100 mt-1">
                  {prescriptionData.patientName || prescribingAppointment?.patient_name || prescribingAppointment?.ref_name}
                  {prescriptionData.appointmentDate ? ` — ${new Date(prescriptionData.appointmentDate).toLocaleDateString()}` : ''}
                  {prescriptionData.appointmentTime ? ` at ${prescriptionData.appointmentTime}` : ''}
                </p>
              </div>
              <button onClick={resetPrescriptionForm} className="text-white hover:bg-indigo-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handlePrescribeSubmit} className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      value={prescriptionData.patientName}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter patient name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={prescriptionData.patientEmail}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, patientEmail: e.target.value }))}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={prescriptionData.patientPhone}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, patientPhone: e.target.value }))}
                      placeholder="Phone number"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input
                      type="text"
                      value={prescriptionData.patientAge}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, patientAge: e.target.value }))}
                      placeholder="Age"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={prescriptionData.patientGender} 
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, patientGender: e.target.value } ))}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Group *</label>
                    <input
                      type="text"
                      value={prescriptionData.bloodGroup}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, bloodGroup: e.target.value }))}
                      placeholder="e.g., O+"                      
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={prescriptionData.diagnosis}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, diagnosis: e.target.value }))}
                      placeholder="e.g., Hypertension"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure *</label>
                    <input
                      type="text"
                      value={prescriptionData.bloodPressure}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, bloodPressure: e.target.value }))}
                      placeholder="e.g., 120/80"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Medicines Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Prescribed Medicines</h3>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium text-sm"
                  >
                    <Plus className="h-4 w-4" /> Add Medicine
                  </button>
                </div>

                {prescriptionData.medicines.map((medicine, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">Medicine #{index + 1}</h4>
                      {prescriptionData.medicines.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedicine(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Medicine Name *</label>
                        <input
                          type="text"
                          value={medicine.name}
                          onChange={(e) => updateMedicine(index, 'name', e.target.value)}
                          placeholder="Medicine name"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Dosage *</label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => updateMedicine(index, 'dosage', e.target.value)}
                          placeholder="e.g., 500mg, 10ml"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Frequency</label>
                        <select
                          value={medicine.frequency}
                          onChange={(e) => updateMedicine(index, 'frequency', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          <option value="Once daily">Once daily</option>
                          <option value="Twice daily">Twice daily</option>
                          <option value="Three times daily">Three times daily</option>
                          <option value="Four times daily">Four times daily</option>
                          <option value="As needed">As needed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Timing</label>
                        <select
                          value={medicine.timing}
                          onChange={(e) => updateMedicine(index, 'timing', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          <option value="Morning">Morning</option>
                          <option value="Evening">Evening</option>
                          <option value="Night">Night</option>
                          <option value="Morning & Evening">Morning & Evening</option>
                          <option value="Morning, Noon & Evening">Morning, Noon & Evening</option>
                          <option value="When symptoms occur">When symptoms occur</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">With Food</label>
                        <select
                          value={medicine.withFood}
                          onChange={(e) => updateMedicine(index, 'withFood', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                          <option value="After meal">After meal</option>
                          <option value="Before meal">Before meal</option>
                          <option value="Before/After meal: Any">Before/After meal: Any</option>
                          <option value="With food">With food</option>
                          <option value="Empty stomach">Empty stomach</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                        <input
                          type="text"
                          value={medicine.duration}
                          onChange={(e) => updateMedicine(index, 'duration', e.target.value)}
                          placeholder="e.g., 7 days, 1 month"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-slate-600 mb-1">Special Notes</label>
                      <input
                        type="text"
                        value={medicine.notes}
                        onChange={(e) => updateMedicine(index, 'notes', e.target.value)}
                        placeholder="e.g., Take with water, do not crush"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Instructions & Follow-up */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Special Instructions</label>
                    <textarea
                      value={prescriptionData.instructions}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="Diet, exercise, precautions"
                      rows="3"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up After</label>
                    <input
                      type="text"
                      value={prescriptionData.followUp}
                      onChange={(e) => setPrescriptionData(prev => ({ ...prev, followUp: e.target.value }))}
                      placeholder="e.g., 2 weeks, 1 month"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={presLoading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {presLoading ? 'Saving...' : (editingId ? 'Update Prescription' : 'Create Prescription')}
                </button>
                <button
                  type="button"
                  onClick={resetPrescriptionForm}
                  className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
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