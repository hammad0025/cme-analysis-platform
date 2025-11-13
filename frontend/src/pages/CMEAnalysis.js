import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const CMEAnalysis = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState({ state: '', search: '' });
  
  useEffect(() => {
    fetchSessions();
  }, []);
  
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cme/sessions');
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error fetching CME sessions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusBadge = (status) => {
    const configs = {
      'created': { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
      'recording_uploaded': { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
      'processing': { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
      'completed': { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
      'error': { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' }
    };
    
    const config = configs[status] || configs['created'];
    const label = status.replace('_', ' ').split(' ').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        {label}
      </span>
    );
  };
  
  const filteredSessions = sessions.filter(session => {
    const matchesState = !filter.state || session.state === filter.state;
    const matchesSearch = !filter.search || 
      session.patient_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      session.doctor_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
      session.session_id?.toLowerCase().includes(filter.search.toLowerCase());
    return matchesState && matchesSearch;
  });
  
  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    processing: sessions.filter(s => s.status === 'processing').length,
    pending: sessions.filter(s => s.status === 'created' || s.status === 'recording_uploaded').length
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CME Analysis</h1>
              <p className="text-xs text-gray-500 mt-0.5">Medical examination analysis platform</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Session
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Completed</p>
                <p className="text-lg font-semibold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Processing</p>
                <p className="text-lg font-semibold text-gray-900">{stats.processing}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">Filters</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  id="search"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Patient, doctor, or session ID..."
                  value={filter.search}
                  onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
                  State
                </label>
                <select
                  id="state"
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  value={filter.state}
                  onChange={(e) => setFilter({ ...filter, state: e.target.value })}
                >
                  <option value="">All States</option>
                  <option value="FL">Florida</option>
                  <option value="CA">California</option>
                  <option value="TX">Texas</option>
                  <option value="PA">Pennsylvania</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilter({ state: '', search: '' })}
                  className="w-full px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">Sessions</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-500">Loading...</p>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-3 text-sm font-medium text-gray-900">No sessions</h3>
              <p className="mt-1 text-xs text-gray-500">Get started by creating a new CME session.</p>
              <div className="mt-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
                >
                  New Session
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredSessions.map((session) => (
                <div
                  key={session.session_id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/sessions/${session.session_id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.patient_name || 'Unnamed Patient'}
                        </p>
                        {getStatusBadge(session.status)}
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {session.state}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{session.doctor_name || 'N/A'}</span>
                        <span>{session.exam_date || 'Not set'}</span>
                        <span>{session.mode || 'N/A'}</span>
                      </div>
                      {session.attorney_name && (
                        <p className="mt-1 text-xs text-gray-500">
                          Attorney: {session.attorney_name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sessions/${session.session_id}`);
                      }}
                      className="ml-4 text-sm text-indigo-600 hover:text-indigo-900"
                    >
                      View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchSessions();
          }}
        />
      )}
    </div>
  );
};

const CreateSessionModal = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient_id: '',
    patient_name: '',
    doctor_name: '',
    state: 'FL',
    exam_date: new Date().toISOString().split('T')[0],
    case_id: '',
    attorney_name: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    
    try {
      const response = await api.post('/cme/sessions', formData);
      if (response.data.session_id) {
        navigate(`/sessions/${response.data.session_id}`);
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating CME session:', error);
      setError(error.response?.data?.error || 'Failed to create session');
    } finally {
      setCreating(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Create New CME Session</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="patient_id" className="block text-xs font-medium text-gray-700 mb-1">
                    Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="patient_id"
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.patient_id}
                    onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="patient_name" className="block text-xs font-medium text-gray-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="patient_name"
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.patient_name}
                    onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="doctor_name" className="block text-xs font-medium text-gray-700 mb-1">
                    Examiner Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="doctor_name"
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-xs font-medium text-gray-700 mb-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="state"
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  >
                    <option value="FL">Florida</option>
                    <option value="CA">California</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="TX">Texas</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="exam_date" className="block text-xs font-medium text-gray-700 mb-1">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="exam_date"
                    required
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.exam_date}
                    onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                  />
                </div>
                
                <div>
                  <label htmlFor="case_id" className="block text-xs font-medium text-gray-700 mb-1">
                    Case ID
                  </label>
                  <input
                    type="text"
                    id="case_id"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.case_id}
                    onChange={(e) => setFormData({ ...formData, case_id: e.target.value })}
                  />
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="attorney_name" className="block text-xs font-medium text-gray-700 mb-1">
                    Attorney Name
                  </label>
                  <input
                    type="text"
                    id="attorney_name"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.attorney_name}
                    onChange={(e) => setFormData({ ...formData, attorney_name: e.target.value })}
                  />
                </div>
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                  {error}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={creating}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CMEAnalysis;
