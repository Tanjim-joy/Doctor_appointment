import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Loader2, X, FileText, Search, Printer, Download, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/PrescriptionsPage.css';


const PrescriptionsPage = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [expandedView, setExpandedView] = useState(null);
  const [printPrescription, setPrintPrescription] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    diagnosis: '',
    bloodPressure: '',
    appointmentId: null,
    appointmentDate: '',
    medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
    instructions: '',
    followUp: '',
  });

  const normalizePrescription = (item) => {
    const parseMedicines = () => {
      if (!item.medicines) return [];
      if (Array.isArray(item.medicines)) return item.medicines;
      if (typeof item.medicines === 'string') {
        try {
          return JSON.parse(item.medicines);
        } catch (err) {
          console.error('Failed to parse prescription medicines:', err, item.medicines);
          return [];
        }
      }
      return [];
    };

    return {
      id: item.prescription_id ?? item.id,
      patientName: item.patient_name || item.patientName || 'Unknown Patient',
      patientEmail: item.patient_email || item.patientEmail || 'N/A',
      patientAge: item.patient_age || item.patientAge || '',
      patientGender: item.patient_gender || item.patientGender || '',
      patientPhone: item.patient_phone || item.patientPhone || '',
      diagnosis: item.diagnosis || '',
      bloodPressure: item.blood_pressure || item.bloodPressure || '',
      bloodSugar: item.blood_sugar || item.bloodSugar || '',
      medicines: parseMedicines(),
      instructions: item.instructions || '',
      followUp: item.follow_up || item.followUp || '',
      createdAt: item.prescription_date ? new Date(item.prescription_date).toLocaleDateString() : (item.createdAt || ''),
      doctorName: item.doctor_name || item.doctorName || user.name || 'Doctor',
      doctorRegNo: item.doctor_reg_no || item.doctorRegNo || 'BMDC-12345',
      hospitalName: item.hospital_name || item.hospitalName || 'General Hospital',
      status: item.status || '',
      appointmentDate: item.appointment_date || '',
      symptoms: item.symptoms || '',
      specialization: item.specialization || '',
      consultationFee: item.consultation_fee || '',
    };
  };

  const normalizeAppointment = (item) => {
    const appointmentDate = item.appointment_date?.split(' ')[0] || item.appointment_date || '';
    const appointmentTime = item.appointment_date?.split(' ')[1]?.slice(0, 5) || '';

    return {
      id: item.id ?? item.appointment_id,
      patientId: item.patient_id || item.patientId || null,
      doctorId: item.doctor_id || item.doctorId || null,
      patientName: item.patient_name || item.patientName || '',
      patientEmail: item.patient_email || item.patientEmail || '',
      patientAge: item.age?.Int64 || item.age || item.patient_age || item.patientAge || '',
      patientGender: item.patient_gender || item.patientGender || '',
      patientPhone: item.patient_phone || item.patientPhone || '',
      doctorName: item.doctor_name || item.doctorName || '',
      appointmentDate,
      appointmentTime,
      status: item.status || '',
      symptoms: item.symptoms || '',
      specialization: item.specialization || item.specialty || '',
    };
  };

  const fetchPrescriptions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:8080/prescriptions/user/${user.id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(`Fetch failed: ${response.status} ${response.statusText} ${message}`);
      }

      const data = await response.json();
      console.log('Fetched prescriptions:', data);

      const prescriptionsData = Array.isArray(data)
        ? data
        : data.data ?? data.prescriptions ?? [];
      setPrescriptions(prescriptionsData.map(normalizePrescription));
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setError('Failed to fetch prescriptions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(
        user.role === 'admin'
          ? 'http://localhost:8080/admin/appointments'
          : `http://localhost:8080/appointments/user/${user.id}`
      );
      const data = await response.json();
      const appointmentData = Array.isArray(data)
        ? data
        : data.appointments ?? data.data ?? [];
      setAppointments(appointmentData.map(normalizeAppointment));
    } catch (err) {
      console.error('Failed to fetch appointments:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchPrescriptions();
      fetchAppointments();
    }
  }, [user?.id]);

  const handlePrescribeFromAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setFormData({
      patientName: appointment.patientName || '',
      patientEmail: appointment.patientEmail || '',
      patientAge: appointment.patientAge || '',
      patientGender: appointment.patientGender || '',
      patientPhone: appointment.patientPhone || '',
      diagnosis: appointment.symptoms || '',
      bloodPressure: '',
      appointmentId: appointment.id,
      appointmentDate: appointment.appointmentDate,
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
      instructions: '',
      followUp: '',
    });
    setShowModal(true);
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    if (!appointmentId) return;
    try {
      const response = await fetch(`http://localhost:8080/appointments/${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        setAppointments(prev => prev.map(app => app.id === appointmentId ? { ...app, status } : app));
        if (selectedAppointment?.id === appointmentId) {
          setSelectedAppointment(prev => prev ? { ...prev, status } : prev);
        }
      } else {
        console.warn('Failed to update appointment status:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }]
    });
  };

  const removeMedicine = (index) => {
    const newMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMedicines });
  };

  const updateMedicine = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setFormData({ ...formData, medicines: newMedicines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientName || !formData.medicines[0].name || !formData.medicines[0].dosage || !formData.bloodPressure) {
      setError('Please fill in all required fields (Patient Name, Blood Pressure, and at least one Medicine with Dosage)');
      return;
    }

    try {
      // Prepare payload for backend
      const payload = {
        patient_name: formData.patientName,
        patient_email: formData.patientEmail,
        patient_age: formData.patientAge,
        patient_gender: formData.patientGender,
        patient_phone: formData.patientPhone,
        diagnosis: formData.diagnosis,
        patient_id: selectedAppointment?.patientId || (user.role === 'patient' ? user.id : null),
        doctor_id: selectedAppointment?.doctorId || (user.role === 'doctor' ? user.id : null),
        blood_pressure: formData.bloodPressure,
        appointment_id: selectedAppointment?.id || formData.appointmentId,
        appointment_date: formData.appointmentDate,
        medicines: JSON.stringify(formData.medicines),
        instructions: formData.instructions,
        follow_up: formData.followUp,
        doctor_name: user.name,
        doctor_reg_no: user.doctorRegNo || 'BMDC-12345',
        hospital_name: user.hospitalName || 'General Hospital',
      };

      if (editingId) {
        // Update existing prescription on backend
        const res = await fetch(`http://localhost:8080/prescriptions/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error('Failed to update prescription');

        const updated = await res.json();
        const normalized = normalizePrescription(updated);
        setPrescriptions(prescriptions.map(p => p.id === editingId ? normalized : p));
        setError('');
      } else {
        // Create new prescription on backend
        const res = await fetch('http://localhost:8080/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || 'Failed to create prescription');
        }

        const created = await res.json();
        const normalized = normalizePrescription(created);
        setPrescriptions(prev => [...prev, normalized]);

        // Mark appointment completed if linked
        const appointmentId = payload.appointment_id;
        if (appointmentId) {
          await updateAppointmentStatus(appointmentId, 'completed');
        }
      }

      resetForm();
    } catch (err) {
      console.error('Prescription save error:', err);
      setError(err.message || 'Failed to save prescription');
    }
  };

  const handleEdit = (prescription) => {
    setFormData({
      patientName: prescription.patientName,
      patientEmail: prescription.patientEmail,
      patientAge: prescription.patientAge,
      patientGender: prescription.patientGender,
      patientPhone: prescription.patientPhone,
      diagnosis: prescription.diagnosis,
      bloodPressure: prescription.bloodPressure || '',
      medicines: prescription.medicines.map(m => ({ ...m })),
      instructions: prescription.instructions,
      followUp: prescription.followUp,
    });
    setEditingId(prescription.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      patientEmail: '',
      patientAge: '',
      patientGender: '',
      patientPhone: '',
      diagnosis: '',
      bloodPressure: '',
      appointmentId: null,
      appointmentDate: '',
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
      instructions: '',
      followUp: '',
    });
    setSelectedAppointment(null);
    setEditingId(null);
    setShowModal(false);
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.patientName?.toLowerCase().includes(term) ||
      p.patientEmail?.toLowerCase().includes(term) ||
      p.diagnosis?.toLowerCase().includes(term) ||
      p.doctorName?.toLowerCase().includes(term) ||
      p.status?.toLowerCase().includes(term) ||
      p.specialization?.toLowerCase().includes(term)
    );
  });

  const viewingPrescription = prescriptions.find(p => p.id === viewingId);
  const confirmedAppointments = appointments.filter(app => app.status.toLowerCase() === 'confirmed');

  // PDF Print Function
  const handlePrintPDF = (prescription) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const medicinesHTML = prescription.medicines.map((med, index) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.dosage}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.frequency}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.timing}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.withFood}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${med.duration}</td>
      </tr>
      ${med.notes ? `
      <tr>
        <td colspan="7" style="border: 1px solid #ddd; padding: 8px; background: #f9f9f9;">
          <strong>Note for ${med.name}:</strong> ${med.notes}
        </td>
      </tr>
      ` : ''}
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${prescription.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
          .header { border-bottom: 3px solid #4F46E5; padding-bottom: 20px; margin-bottom: 20px; }
          .header h1 { color: #4F46E5; margin: 0; }
          .header p { margin: 5px 0; color: #666; }
          .section { margin-bottom: 25px; }
          .section h2 { color: #4F46E5; font-size: 18px; border-bottom: 2px solid #E5E7EB; padding-bottom: 5px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
          .info-item { margin-bottom: 10px; }
          .info-item strong { color: #666; display: block; font-size: 12px; text-transform: uppercase; }
          .info-item span { font-size: 16px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #4F46E5; color: white; padding: 10px; text-align: left; font-size: 13px; }
          td { padding: 8px; font-size: 13px; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: right; }
          .signature { font-weight: bold; color: #4F46E5; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <button onclick="window.print()" style="float: right; background: #4F46E5; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">
          🖨️ Print Prescription
        </button>
        
        <div class="header">
          <h1>${prescription.hospitalName || 'General Hospital'}</h1>
          <p>Doctor: ${prescription.doctorName}</p>
          <p>Reg. No: ${prescription.doctorRegNo || 'N/A'}</p>
          <p>Date: ${prescription.createdAt}</p>
        </div>

        <div class="section">
          <h2>Patient Information</h2>
          <div class="grid">
            <div class="info-item">
              <strong>Name</strong>
              <span>${prescription.patientName}</span>
            </div>
            <div class="info-item">
              <strong>Age</strong>
              <span>${prescription.patientAge || 'N/A'}</span>
            </div>
            <div class="info-item">
              <strong>Gender</strong>
              <span>${prescription.patientGender || 'N/A'}</span>
            </div>
            <div class="info-item">
              <strong>Email</strong>
              <span>${prescription.patientEmail}</span>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Diagnosis</h2>
          <p style="font-size: 16px; font-weight: bold;">${prescription.diagnosis}</p>
          ${prescription.bloodPressure ? `<p><strong>BP:</strong> ${prescription.bloodPressure}</p>` : ''}
          ${prescription.bloodSugar ? `<p><strong>Blood Sugar:</strong> ${prescription.bloodSugar}</p>` : ''}
        </div>

        <div class="section">
          <h2>Prescribed Medicines</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Timing</th>
                <th>With Food</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${medicinesHTML}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Special Instructions</h2>
          <p style="background: #F9FAFB; padding: 15px; border-radius: 5px; border-left: 4px solid #4F46E5;">
            ${prescription.instructions}
          </p>
        </div>

        ${prescription.followUp ? `
        <div class="section">
          <h2>Follow-up</h2>
          <p style="font-weight: bold;">Follow-up after: ${prescription.followUp}</p>
        </div>
        ` : ''}

        <div class="footer">
          <p class="signature">${prescription.doctorName}</p>
          <p>Reg. No: ${prescription.doctorRegNo || 'N/A'}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-slate-50/50">
  {/* Header Section */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 pb-6 border-b border-slate-200">
    <div>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
        <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
          <FileText className="h-8 w-8" />
        </div>
        Prescription Management
      </h1>
      <p className="text-slate-500 mt-2 text-sm sm:text-base">
        Manage and create detailed medical prescriptions with clear dosage structures.
      </p>
    </div>
    
    {user.role === 'doctor' && (
      <button
        onClick={() => {
          resetForm();
          setShowModal(true);
        }}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-white font-semibold hover:bg-indigo-700 active:bg-indigo-800 transition-all shadow-sm hover:shadow-md"
      >
        <Plus className="h-5 w-5" />
        <span>New Prescription</span>
      </button>
    )}
  </div>

  {/* Error Message Toast / Alert */}
  {error && (
    <div className="mb-6 rounded-xl bg-red-50 border border-red-200/60 p-4 flex justify-between items-center shadow-sm animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-1 bg-red-100 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
      <button 
        onClick={() => setError('')} 
        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-100/50 transition"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )}

  {/* Confirmed Appointments Panel */}
  {(user.role === 'doctor' || user.role === 'patient' || user.role === 'admin') && (
    <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Confirmed Appointments</h2>
          <p className="text-sm text-slate-500 mt-1">
            Only confirmed appointments can be prescribed. Select a patient appointment to create a prescription.
          </p>
        </div>
        {user.role === 'doctor' && (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
            {confirmedAppointments.length} confirmed appointment{confirmedAppointments.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {confirmedAppointments.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
          <p>No confirmed appointments found yet.</p>
          {user.role === 'doctor' && <p className="mt-2 text-sm">Once an appointment becomes confirmed, you can prescribe from this page.</p>}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {confirmedAppointments.map((appointment) => (
            <div key={appointment.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">Patient</p>
                  <p className="font-semibold text-slate-900">{appointment.patientName || 'Unknown'}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {appointment.status || 'Confirmed'}
                </span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-slate-600">
                <div><strong>Date:</strong> {appointment.appointmentDate || 'N/A'}</div>
                <div><strong>Time:</strong> {appointment.appointmentTime || 'N/A'}</div>
                <div><strong>Doctor:</strong> {appointment.doctorName || 'N/A'}</div>
                {appointment.symptoms && <div><strong>Symptoms:</strong> {appointment.symptoms}</div>}
              </div>

              {user.role === 'doctor' && (
                <button
                  onClick={() => handlePrescribeFromAppointment(appointment)}
                  className="mt-5 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Prescribe for this appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {/* Search Bar Container */}
  <div className="mb-8 relative max-w-2xl">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
    <input
      type="text"
      placeholder="Search by patient name, email, or diagnosis..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
    />
  </div>

  {/* Main Content Loading / Cards States */}
  {loading ? (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      <span className="mt-4 text-sm font-medium text-slate-500 tracking-wide">Loading prescriptions...</span>
    </div>
  ) : (
    <div className="space-y-4">
      {filteredPrescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-slate-100 shadow-sm max-w-xl mx-auto mt-8">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">No prescriptions found</h3>
          <p className="text-slate-500 text-sm">Try modifying your keyword search or add a new record.</p>
        </div>
      ) : (
        filteredPrescriptions.map((prescription) => (
          <div 
            key={prescription.id} 
            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                
                {/* Information Segment */}
                <div className="flex-1 space-y-3">
                  {/* Title and Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-xl font-bold text-slate-900">{prescription.patientName}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                      {prescription.patientAge ? `${prescription.patientAge} yrs` : ''} • {prescription.patientGender}
                    </span>
                    {prescription.status && (
                      <span className="inline-flex items-center px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md uppercase tracking-wider">
                        {prescription.status}
                      </span>
                    )}
                  </div>

                  {/* Core Context Row */}
                  <div className="text-sm text-slate-600 space-y-1.5">
                    <p className="font-medium text-slate-700">{prescription.patientEmail}</p>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                      {prescription.specialization && (
                        <div><strong>Specialty:</strong> {prescription.specialization}</div>
                      )}
                      <div>
                        <strong>Appointment:</strong> {prescription.appointmentDate ? new Date(prescription.appointmentDate).toLocaleDateString() : 'N/A'}
                      </div>
                      <div>
                        <strong>Doctor:</strong> {prescription.doctorName}
                      </div>
                      <div>
                        <strong>Issued:</strong> {prescription.createdAt}
                      </div>
                    </div>
                  </div>

                  {/* Clinical Indicators */}
                  <div className="pt-2 border-t border-slate-100 grid gap-2 sm:grid-cols-2">
                    <div className="text-sm bg-slate-50/60 rounded-xl p-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Diagnosis</span>
                      <span className="text-slate-800 font-medium">{prescription.diagnosis}</span>
                    </div>
                    {prescription.symptoms && (
                      <div className="text-sm bg-slate-50/60 rounded-xl p-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Symptoms</span>
                        <span className="text-slate-800">{prescription.symptoms}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Expand / Collapse Accordion Trigger */}
                  <button
                    onClick={() => setExpandedView(expandedView === prescription.id ? null : prescription.id)}
                    className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 text-sm font-semibold transition mt-2 pt-1"
                  >
                    {expandedView === prescription.id ? (
                      <><ChevronUp className="h-4 w-4" /> Hide Medicines Details</>
                    ) : (
                      <><ChevronDown className="h-4 w-4" /> Show Medicines Details</>
                    )}
                  </button>

                  {/* Sub-Panel: Expanded Medicine Information */}
                  {expandedView === prescription.id && (
                    <div className="mt-4 bg-slate-50/80 rounded-xl p-4 border border-slate-100 animate-slide-down">
                      <h4 className="font-bold text-slate-900 text-sm tracking-wide uppercase mb-3 flex items-center gap-2">
                        <span>💊</span> Prescribed Medicines ({prescription.medicines.length})
                      </h4>
                      
                      <div className="space-y-2.5">
                        {prescription.medicines.map((med, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="bg-indigo-50 text-indigo-700 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">
                                  {index + 1}
                                </div>
                                <div>
                                  <h5 className="font-bold text-slate-900 text-base">{med.name}</h5>
                                  <p className="text-xs text-slate-500 mt-0.5">Dosage: <span className="font-medium text-slate-700">{med.dosage}</span></p>
                                </div>
                              </div>
                            </div>

                            {/* Detail Metadata Matrix */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">Frequency</p>
                                <p className="text-sm font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" /> {med.frequency}
                                </p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">Timing</p>
                                <p className="text-sm font-medium text-slate-800 mt-0.5">{med.timing}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">With Food</p>
                                <p className="text-sm font-medium text-slate-800 mt-0.5">{med.withFood}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase">Duration</p>
                                <p className="text-sm font-semibold text-indigo-700 mt-0.5">{med.duration}</p>
                              </div>
                            </div>

                            {/* Special Intake Warnings */}
                            {med.notes && (
                              <div className="mt-2.5 flex items-start gap-2 bg-amber-50/70 border border-amber-100 p-2.5 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs font-medium text-amber-800">{med.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* General Patient Intake Notes */}
                      {prescription.instructions && (
                        <div className="mt-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl flex gap-2">
                          <span className="text-sm">📋</span>
                          <p className="text-xs sm:text-sm font-medium text-blue-900">
                            <strong>Instructions:</strong> {prescription.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Align Action Button Panel */}
                <div className="flex lg:flex-col items-center justify-end gap-1.5 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => setViewingId(prescription.id)}
                    className="p-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePrintPDF(prescription)}
                    className="p-2.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition"
                    title="Print/Download PDF"
                  >
                    <Printer className="h-5 w-5" />
                  </button>
                  {user.role === 'doctor' && (
                    <>
                      <button
                        onClick={() => handleEdit(prescription)}
                        className="p-2.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                        title="Edit"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prescription.id)}
                        className="p-2.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
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
  )}
</div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Prescription' : selectedAppointment ? 'Prescribe for Confirmed Appointment' : 'Create New Prescription'}
                </h2>
                {selectedAppointment && (
                  <p className="text-sm text-indigo-100 mt-1">
                    {selectedAppointment.patientName} — {selectedAppointment.appointmentDate} at {selectedAppointment.appointmentTime || 'N/A'}
                  </p>
                )}
              </div>
              <button onClick={resetForm} className="text-white hover:bg-indigo-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      placeholder="Enter patient name"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.patientEmail}
                      onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                      placeholder="patient@example.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.patientPhone}
                      onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                      placeholder="Phone number"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
                    <input
                      type="text"
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      placeholder="Age"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                    <input
                      type="text"
                      value={formData.diagnosis}
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                      placeholder="e.g., Hypertension"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Blood Pressure *</label>
                    <input
                      type="text"
                      value={formData.bloodPressure}
                      onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
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

                {formData.medicines.map((medicine, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900">Medicine #{index + 1}</h4>
                      {formData.medicines.length > 1 && (
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
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Diet, exercise, precautions"
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Follow-up After</label>
                  <input
                    type="text"
                    value={formData.followUp}
                    onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
                    placeholder="e.g., 2 weeks, 1 month"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {editingId ? 'Update Prescription' : 'Create Prescription'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-slate-200 text-slate-900 py-3 rounded-lg font-semibold hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Prescription Details</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintPDF(viewingPrescription)}
                  className="text-white hover:bg-blue-800 p-2 rounded"
                  title="Print PDF"
                >
                  <Printer className="h-5 w-5" />
                </button>
                <button onClick={() => setViewingId(null)} className="text-white hover:bg-blue-800 p-1 rounded">
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Patient Info */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-semibold text-slate-900">{viewingPrescription.patientName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-semibold text-slate-900">{viewingPrescription.patientEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Age/Gender</p>
                    <p className="font-semibold text-slate-900">
                      {viewingPrescription.patientAge || 'N/A'} yrs, {viewingPrescription.patientGender || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Diagnosis</h3>
                <p className="text-slate-800 bg-blue-50 p-3 rounded-lg font-medium">
                  {viewingPrescription.diagnosis}
                </p>
              </div>

              {/* Medicines */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Prescribed Medicines</h3>
                <div className="space-y-3">
                  {viewingPrescription.medicines.map((med, index) => (
                    <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{med.name} - {med.dosage}</h4>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-xs text-slate-500">Frequency:</span>
                              <span className="text-sm font-medium ml-1">{med.frequency}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">Timing:</span>
                              <span className="text-sm font-medium ml-1">{med.timing}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">With Food:</span>
                              <span className="text-sm font-medium ml-1">{med.withFood}</span>
                            </div>
                            <div>
                              <span className="text-xs text-slate-500">Duration:</span>
                              <span className="text-sm font-medium ml-1">{med.duration}</span>
                            </div>
                          </div>
                          {med.notes && (
                            <p className="mt-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                              📝 {med.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Special Instructions</h3>
                <p className="text-slate-800 bg-blue-50 p-4 rounded-lg">
                  {viewingPrescription.instructions}
                </p>
              </div>

              {/* Follow-up */}
              {viewingPrescription.followUp && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Follow-up</h3>
                  <p className="text-slate-800 font-medium">After: {viewingPrescription.followUp}</p>
                </div>
              )}

              {/* Doctor Info */}
              <div className="border-t pt-4">
                <p className="text-sm text-slate-500">Prescribed by</p>
                <p className="font-semibold text-slate-900">{viewingPrescription.doctorName}</p>
                <p className="text-sm text-slate-600">Date: {viewingPrescription.createdAt}</p>
              </div>

              <button
                onClick={() => setViewingId(null)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
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

export default PrescriptionsPage;