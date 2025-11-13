import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/cmeApi';

const CMESessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);
  
  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cme/sessions/${sessionId}`);
      setSession(response.data);
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const response = await api.post('/cme/upload', {
        session_id: sessionId,
        filename: file.name,
        content_type: file.type,
        file_size: file.size
      });
      
      const { upload_url } = response.data;
      
      await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });
      
      await api.post('/cme/process', { session_id: sessionId });
      fetchSessionDetails();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload recording');
    }
  };
  
  const generateReport = async () => {
    try {
      const response = await api.get(`/cme/sessions/${sessionId}/report`);
      if (response.data.download_url) {
        window.open(response.data.download_url, '_blank');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-3 text-sm font-medium text-gray-900">Session Not Found</h2>
          <p className="mt-1 text-xs text-gray-500">The session you're looking for doesn't exist.</p>
          <div className="mt-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700"
            >
              Back to Sessions
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700 mb-3"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{session.patient_name || 'CME Session'}</h1>
                <div className="mt-2 flex items-center gap-2">
                  <StatusBadge status={session.status} />
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                    {session.state}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                    {session.mode}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {session.status === 'completed' && (
                  <button
                    onClick={generateReport}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Report
                  </button>
                )}
                {session.status === 'created' && (
                  <label className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 cursor-pointer">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload
                    <input
                      type="file"
                      accept="video/*,audio/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'overview', name: 'Overview' },
                { id: 'timeline', name: 'Timeline' },
                { id: 'demeanor', name: 'Demeanor' },
                { id: 'recordings', name: 'Recordings' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    ${activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                    whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2
                  `}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'overview' && <OverviewTab session={session} />}
            {activeTab === 'timeline' && <TimelineTab session={session} />}
            {activeTab === 'demeanor' && <DemeanorTab session={session} />}
            {activeTab === 'recordings' && <RecordingsTab session={session} />}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatusBadge = ({ status }) => {
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

const OverviewTab = ({ session }) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Session Information</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-xs text-gray-500">Patient ID</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.patient_id}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Examiner</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.doctor_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Exam Date</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.exam_date || 'Not set'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Attorney</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.attorney_name || 'N/A'}</dd>
        </div>
      </dl>
    </div>
    
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-4">Recording Details</h3>
      <dl className="space-y-3">
        <div>
          <dt className="text-xs text-gray-500">Recording Mode</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.mode}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">State</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.state}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Legal Basis</dt>
          <dd className="mt-0.5 text-sm text-gray-900">{session.recording_allowed?.rule || 'N/A'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Video Permitted</dt>
          <dd className="mt-0.5">
            {session.recording_allowed?.video ? (
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Yes</span>
            ) : (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded">No</span>
            )}
          </dd>
        </div>
      </dl>
    </div>
  </div>
);

const TimelineTab = ({ session }) => (
  <div className="bg-blue-50 border border-blue-200 rounded p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-blue-800">Processing Status</h3>
        <div className="mt-1 text-sm text-blue-700">
          <p>{session.processing_stage || 'Not started'}</p>
          <p className="mt-2 text-xs">Test declarations and observed actions will appear here after processing completes.</p>
        </div>
      </div>
    </div>
  </div>
);

const DemeanorTab = ({ session }) => (
  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-yellow-800">Demeanor Analysis</h3>
        <div className="mt-1 text-sm text-yellow-700">
          <p>Analysis will detect negative tone, interruptions, dismissive behavior, and unprofessional conduct.</p>
          <p className="mt-2 text-xs">Results will appear here after processing completes.</p>
        </div>
      </div>
    </div>
  </div>
);

const RecordingsTab = ({ session }) => (
  <div>
    {session.video_uri ? (
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recording</h3>
        <div className="bg-gray-50 rounded p-3 border border-gray-200">
          <dt className="text-xs text-gray-500 mb-1">Video URI</dt>
          <dd className="text-xs font-mono text-gray-900 break-all">{session.video_uri}</dd>
        </div>
      </div>
    ) : (
      <div className="text-center py-8">
        <svg className="mx-auto h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-3 text-sm font-medium text-gray-900">No Recording Uploaded</h3>
        <p className="mt-1 text-xs text-gray-500">Upload a recording to begin analysis.</p>
      </div>
    )}
  </div>
);

export default CMESessionDetail;
