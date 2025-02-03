// src/pages/admin/HostApplications.jsx
import React, { useState, useEffect } from 'react';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../services/api';

const ApplicationCard = ({ application, onAction, onExpand, isExpanded }) => {
  const statusColors = {
    PENDING: 'text-yellow-500',
    APPROVED: 'text-green-500',
    REJECTED: 'text-red-500'
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-white">
            {application.user.username}
          </h3>
          <p className="text-sm text-gray-400">
            Applied {new Date(application.created_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {application.status === 'PENDING' && (
            <>
              <button
                onClick={() => onAction(application.id, 'approve')}
                className="p-2 text-green-500 hover:bg-green-500/10 rounded-full transition-colors"
                title="Approve"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => onAction(application.id, 'reject')}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                title="Reject"
              >
                <X size={20} />
              </button>
            </>
          )}
          <button
            onClick={() => onExpand(application.id)}
            className="p-2 text-gray-400 hover:bg-white/10 rounded-full transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white/10 pt-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">
                Gaming Experience
              </h4>
              <p className="text-white">{application.experience}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">
                Availability
              </h4>
              <p className="text-white">{application.availability}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">
                Previous Experience
              </h4>
              <p className="text-white">{application.previous_experience}</p>
            </div>

            {application.additional_info && (
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">
                  Additional Information
                </h4>
                <p className="text-white">{application.additional_info}</p>
              </div>
            )}

            <div className="text-sm text-gray-400">
              Status: <span className={`font-medium ${statusColors[application.status]}`}>
                {application.status}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HostApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/api/v1/host-applications');
      setApplications(response.data);
    } catch (err) {
      setError('Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAction = async (applicationId, action) => {
    try {
      await api.put(`/api/v1/host-applications/${applicationId}/${action}`);
      // Refresh the applications list
      fetchApplications();
    } catch (err) {
      setError(`Failed to ${action} application`);
      console.error(`Error ${action}ing application:`, err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2979FF]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-red-500 text-center py-8 bg-red-500/10 border border-red-500/50 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Host Applications</h1>
      
      <div className="space-y-4">
        {applications.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No applications to review</p>
        ) : (
          applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onAction={handleAction}
              onExpand={(id) => setExpandedId(expandedId === id ? null : id)}
              isExpanded={expandedId === application.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HostApplications;