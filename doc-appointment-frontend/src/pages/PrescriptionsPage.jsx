import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Loader2, X, FileText, Search, Printer, Download, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/PrescriptionsPage.css';

// Demo prescription data with enhanced dosage details
const DEMO_PRESCRIPTIONS = [
  {
    id: 1,
    patientName: 'Ahmed Hassan',
    patientEmail: 'ahmed@example.com',
    patientAge: '45',
    patientGender: 'Male',
    patientPhone: '+880 1712-345678',
    diagnosis: 'Hypertension',
    bloodPressure: '140/90 mmHg',
    medicines: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '30 days', notes: 'Take with full glass of water' },
      { name: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily', timing: 'Morning & Evening', withFood: 'After meal', duration: '30 days', notes: 'Do not crush or chew' },
    ],
    instructions: 'Avoid high salt foods. Regular exercise recommended. Monitor BP weekly.',
    followUp: '2 weeks',
    createdAt: new Date().toLocaleDateString(),
    doctorName: 'Dr. Smith',
    doctorRegNo: 'BMDC-12345',
    hospitalName: 'Dhaka Medical College Hospital',
  },
  {
    id: 2,
    patientName: 'Fatima Khan',
    patientEmail: 'fatima@example.com',
    patientAge: '52',
    patientGender: 'Female',
    patientPhone: '+880 1812-345678',
    diagnosis: 'Diabetes Type 2',
    bloodSugar: 'Fasting: 8.2 mmol/L',
    medicines: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', timing: 'Morning & Evening', withFood: 'After meal', duration: '60 days', notes: 'Take with meals to reduce stomach upset' },
      { name: 'Glipizide', dosage: '5mg', frequency: 'Once daily', timing: 'Morning', withFood: 'Before meal', duration: '30 days', notes: 'Take 30 minutes before breakfast' },
    ],
    instructions: 'Monitor blood sugar daily. Follow diabetic diet plan. Regular exercise.',
    followUp: '1 month',
    createdAt: new Date().toLocaleDateString(),
    doctorName: 'Dr. Rahman',
    doctorRegNo: 'BMDC-23456',
    hospitalName: 'BIRDEM Hospital',
  },
  {
    id: 3,
    patientName: 'Karim Ahmed',
    patientEmail: 'karim@example.com',
    patientAge: '28',
    patientGender: 'Male',
    patientPhone: '+880 1912-345678',
    diagnosis: 'Asthma with Allergic Rhinitis',
    medicines: [
      { name: 'Albuterol Inhaler', dosage: '2 puffs', frequency: 'As needed', timing: 'When symptoms occur', withFood: 'Before/After meal: Any', duration: '30 days', notes: 'Maximum 8 puffs per day. Shake well before use.' },
      { name: 'Fluticasone Inhaler', dosage: '1 puff', frequency: 'Twice daily', timing: 'Morning & Evening', withFood: 'Before/After meal: Any', duration: '30 days', notes: 'Rinse mouth after use to prevent thrush' },
      { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily', timing: 'Night', withFood: 'Before meal', duration: '30 days', notes: 'Take on empty stomach' },
    ],
    instructions: 'Avoid dust, smoke, and allergens. Use spacer with inhaler. Keep rescue inhaler handy.',
    followUp: '3 weeks',
    createdAt: new Date().toLocaleDateString(),
    doctorName: 'Dr. Smith',
    doctorRegNo: 'BMDC-12345',
    hospitalName: 'Dhaka Medical College Hospital',
  },
];

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

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientAge: '',
    patientGender: '',
    patientPhone: '',
    diagnosis: '',
    medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
    instructions: '',
    followUp: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPrescriptions([...DEMO_PRESCRIPTIONS]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.patientName || !formData.medicines[0].name || !formData.medicines[0].dosage) {
      setError('Please fill in all required fields (Patient Name, at least one Medicine with Dosage)');
      return;
    }

    try {
      if (editingId) {
        setPrescriptions(prescriptions.map(p =>
          p.id === editingId
            ? {
                ...formData,
                id: editingId,
                createdAt: p.createdAt,
                doctorName: user.name,
                doctorRegNo: user.doctorRegNo || 'BMDC-12345',
                hospitalName: user.hospitalName || 'General Hospital',
              }
            : p
        ));
      } else {
        const newPrescription = {
          id: Math.max(0, ...prescriptions.map(p => p.id)) + 1,
          ...formData,
          createdAt: new Date().toLocaleDateString(),
          doctorName: user.name,
          doctorRegNo: user.doctorRegNo || 'BMDC-12345',
          hospitalName: user.hospitalName || 'General Hospital',
        };
        setPrescriptions([...prescriptions, newPrescription]);
      }

      resetForm();
      setError('');
    } catch (err) {
      setError('Failed to save prescription');
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
      medicines: [{ name: '', dosage: '', frequency: 'Once daily', timing: 'Morning', withFood: 'After meal', duration: '', notes: '' }],
      instructions: '',
      followUp: '',
    });
    setEditingId(null);
    setShowModal(false);
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewingPrescription = prescriptions.find(p => p.id === viewingId);

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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="h-10 w-10 text-indigo-600" />
              Prescription Management
            </h1>
            <p className="text-slate-600 mt-2">Manage and create detailed medical prescriptions with dosage instructions</p>
          </div>
          {user.role === 'doctor' && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition shadow-lg"
            >
              <Plus className="h-5 w-5" />
              New Prescription
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, email, or diagnosis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="ml-3 text-slate-600">Loading prescriptions...</span>
          </div>
        ) : (
          <>
            {/* Prescriptions Cards */}
            <div className="space-y-6">
              {filteredPrescriptions.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No prescriptions found</p>
                </div>
              ) : (
                filteredPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-900">{prescription.patientName}</h3>
                            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                              {prescription.patientAge ? `${prescription.patientAge} yrs` : ''} {prescription.patientGender}
                            </span>
                          </div>
                          <p className="text-slate-600 mb-1">{prescription.patientEmail}</p>
                          <p className="text-sm text-slate-500">
                            <strong>Diagnosis:</strong> {prescription.diagnosis}
                          </p>
                          <p className="text-sm text-slate-500">
                            <strong>Doctor:</strong> {prescription.doctorName} | <strong>Date:</strong> {prescription.createdAt}
                          </p>
                          
                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => setExpandedView(expandedView === prescription.id ? null : prescription.id)}
                            className="mt-3 inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            {expandedView === prescription.id ? (
                              <><ChevronUp className="h-4 w-4" /> Show Less</>
                            ) : (
                              <><ChevronDown className="h-4 w-4" /> Show Medicines Details</>
                            )}
                          </button>

                          {/* Expanded Medicines View */}
                          {expandedView === prescription.id && (
                            <div className="mt-4 bg-slate-50 rounded-lg p-4">
                              <h4 className="font-semibold text-slate-900 mb-3">💊 Prescribed Medicines</h4>
                              <div className="space-y-3">
                                {prescription.medicines.map((med, index) => (
                                  <div key={index} className="bg-white p-4 rounded-lg border border-slate-200">
                                    <div className="flex items-start gap-2 mb-2">
                                      <div className="bg-indigo-100 text-indigo-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                                        {index + 1}
                                      </div>
                                      <div>
                                        <h5 className="font-semibold text-slate-900">{med.name}</h5>
                                        <p className="text-sm text-slate-600">{med.dosage}</p>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                                      <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-slate-400" />
                                        <div>
                                          <p className="text-xs text-slate-500">Frequency</p>
                                          <p className="text-sm font-medium">{med.frequency}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Timing</p>
                                        <p className="text-sm font-medium">{med.timing}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">With Food</p>
                                        <p className="text-sm font-medium">{med.withFood}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-slate-500">Duration</p>
                                        <p className="text-sm font-medium">{med.duration}</p>
                                      </div>
                                    </div>
                                    {med.notes && (
                                      <div className="mt-2 flex items-start gap-2 bg-yellow-50 p-2 rounded">
                                        <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                        <p className="text-sm text-yellow-800">{med.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {prescription.instructions && (
                                <div className="mt-4 p-3 bg-blue-50 rounded">
                                  <p className="text-sm font-medium text-blue-900">📋 Instructions: {prescription.instructions}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewingId(prescription.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                            title="View details"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handlePrintPDF(prescription)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded transition"
                            title="Print/Download PDF"
                          >
                            <Printer className="h-5 w-5" />
                          </button>
                          {user.role === 'doctor' && (
                            <>
                              <button
                                onClick={() => handleEdit(prescription)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                title="Edit"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(prescription.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Prescription' : 'Create New Prescription'}
              </h2>
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