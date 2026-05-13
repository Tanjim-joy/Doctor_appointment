import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Loader2, X, FileText, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/PrescriptionsPage.css';

// Demo prescription data
const DEMO_PRESCRIPTIONS = [
  {
    id: 1,
    patientName: 'Ahmed Hassan',
    patientEmail: 'ahmed@example.com',
    diagnosis: 'Hypertension',
    medicines: 'Amlodipine, Metoprolol',
    dosage: '5mg, 50mg',
    duration: '30 days',
    instructions: 'Take one tablet daily in morning with water',
    createdAt: new Date().toLocaleDateString(),
    doctorName: 'Dr. Smith',
  },
  {
    id: 2,
    patientName: 'Fatima Khan',
    patientEmail: 'fatima@example.com',
    diagnosis: 'Diabetes Type 2',
    medicines: 'Metformin, Glipizide',
    dosage: '500mg, 5mg',
    duration: '60 days',
    instructions: 'Take before meals. Monitor blood sugar regularly',
    createdAt: new Date().toLocaleDateString(),
    doctorName: 'Dr. Rahman',
  },
  {
    id: 3,
    patientName: 'Karim Ahmed',
    patientEmail: 'karim@example.com',
    diagnosis: 'Asthma',
    medicines: 'Albuterol, Fluticasone',
    dosage: '2 puffs, 1 puff',
    duration: '30 days',
    instructions: 'Use inhaler as needed. Do not overuse',
    createdAt: new Date().toLocaleDateString(),
    doctorName: 'Dr. Smith',
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

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    medicines: '',
    dosage: '',
    duration: '',
    instructions: '',
    diagnosis: '',
  });

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setPrescriptions([...DEMO_PRESCRIPTIONS]);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.patientName || !formData.medicines || !formData.dosage) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update prescription
        setPrescriptions(prescriptions.map(p =>
          p.id === editingId
            ? {
                ...formData,
                id: editingId,
                createdAt: p.createdAt,
                doctorName: user.name,
              }
            : p
        ));
      } else {
        // Create prescription
        const newPrescription = {
          id: Math.max(0, ...prescriptions.map(p => p.id)) + 1,
          ...formData,
          createdAt: new Date().toLocaleDateString(),
          doctorName: user.name,
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
      medicines: prescription.medicines,
      dosage: prescription.dosage,
      duration: prescription.duration,
      instructions: prescription.instructions,
      diagnosis: prescription.diagnosis,
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
      medicines: '',
      dosage: '',
      duration: '',
      instructions: '',
      diagnosis: '',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="h-10 w-10 text-indigo-600" />
              প্রেসক্রিপশন ম্যানেজমেন্ট
            </h1>
            <p className="text-slate-600 mt-2">Manage and create medical prescriptions (Demo Data)</p>
          </div>
          {user.role === 'doctor' && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="h-5 w-5" />
              নতুন প্রেসক্রিপশন
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
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            {/* Prescriptions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {filteredPrescriptions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No prescriptions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Patient</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Diagnosis</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Medicines</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPrescriptions.map((prescription) => (
                        <tr key={prescription.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{prescription.patientName}</p>
                              <p className="text-sm text-slate-500">{prescription.patientEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{prescription.diagnosis}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{prescription.medicines}</td>
                          <td className="px-6 py-4 text-slate-700">{prescription.duration}</td>
                          <td className="px-6 py-4 text-slate-600">{prescription.createdAt}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewingId(prescription.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {user.role === 'doctor' && (
                                <>
                                  <button
                                    onClick={() => handleEdit(prescription)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(prescription.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Prescription' : 'নতুন প্রেসক্রিপশন তৈরি করুন'}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-indigo-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Patient Name *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter patient name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Patient Email *</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Diagnosis</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g., Hypertension"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 30 days"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Medicines *</label>
                <textarea
                  value={formData.medicines}
                  onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                  placeholder="List all medicines (comma separated)"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Dosage *</label>
                <textarea
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="Dosage for each medicine"
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special instructions for patient"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {editingId ? 'Update Prescription' : 'Create Prescription'}
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

      {/* View Modal */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Prescription Details</h2>
              <button onClick={() => setViewingId(null)} className="text-white hover:bg-blue-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Patient Name</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.patientName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Email</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.patientEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Diagnosis</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.diagnosis}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Duration</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.duration}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Medicines</h3>
                <p className="text-slate-900 whitespace-pre-wrap">{viewingPrescription.medicines}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Dosage</h3>
                <p className="text-slate-900 whitespace-pre-wrap">{viewingPrescription.dosage}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Instructions</h3>
                <p className="text-slate-900 whitespace-pre-wrap">{viewingPrescription.instructions}</p>
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

export default PrescriptionsPage;

  const filteredPrescriptions = prescriptions.filter(p =>
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewingPrescription = prescriptions.find(p => p.id === viewingId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="h-10 w-10 text-indigo-600" />
              প্রেসক্রিপশন ম্যানেজমেন্ট
            </h1>
            <p className="text-slate-600 mt-2">Manage and create medical prescriptions</p>
          </div>
          {user.role === 'doctor' && (
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-white font-semibold hover:bg-indigo-700 transition"
            >
              <Plus className="h-5 w-5" />
              নতুন প্রেসক্রিপশন
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
            className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            {/* Prescriptions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {filteredPrescriptions.length === 0 ? (
                <div className="p-12 text-center">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No prescriptions found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Patient</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Diagnosis</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Medicines</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Duration</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Date</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredPrescriptions.map((prescription) => (
                        <tr key={prescription.id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium text-slate-900">{prescription.patientName}</p>
                              <p className="text-sm text-slate-500">{prescription.patientEmail}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">{prescription.diagnosis}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{prescription.medicines}</td>
                          <td className="px-6 py-4 text-slate-700">{prescription.duration}</td>
                          <td className="px-6 py-4 text-slate-600">{prescription.createdAt}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => setViewingId(prescription.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                                title="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {user.role === 'doctor' && (
                                <>
                                  <button
                                    onClick={() => handleEdit(prescription)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                                    title="Edit"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(prescription.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Edit Prescription' : 'নতুন প্রেসক্রিপশন তৈরি করুন'}
              </h2>
              <button onClick={resetForm} className="text-white hover:bg-indigo-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Patient Name *</label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    placeholder="Enter patient name"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Patient Email *</label>
                  <input
                    type="email"
                    value={formData.patientEmail}
                    onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Diagnosis</label>
                  <input
                    type="text"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    placeholder="e.g., Hypertension"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 30 days"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Medicines *</label>
                <textarea
                  value={formData.medicines}
                  onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                  placeholder="List all medicines (comma separated)"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Dosage *</label>
                <textarea
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="Dosage for each medicine"
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Special instructions for patient"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {editingId ? 'Update Prescription' : 'Create Prescription'}
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

      {/* View Modal */}
      {viewingPrescription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Prescription Details</h2>
              <button onClick={() => setViewingId(null)} className="text-white hover:bg-blue-800 p-1 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Patient Name</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.patientName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Email</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.patientEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Diagnosis</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.diagnosis}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-500 uppercase">Duration</h3>
                  <p className="text-lg font-semibold text-slate-900">{viewingPrescription.duration}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Medicines</h3>
                <p className="text-slate-900 whitespace-pre-wrap">{viewingPrescription.medicines}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Dosage</h3>
                <p className="text-slate-900 whitespace-pre-wrap">{viewingPrescription.dosage}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase mb-2">Instructions</h3>
                <p className="text-slate-900 whitespace-pre-wrap">{viewingPrescription.instructions}</p>
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

export default PrescriptionsPage;
