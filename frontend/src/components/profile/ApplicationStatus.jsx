// src/components/profile/ApplicationStatus.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../ui/Card';
import api from '../../services/api';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const ApplicationStatus = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchApplicationStatus = async () => {
      try {
        const response = await api.get('/api/v1/host-applications/me');
        if (response.data.length > 0) {
          setApplication(response.data[0]); // Get most recent application
        }
      } catch (error) {
        console.error('Error fetching application:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationStatus();
  }, []);

  // Don't show anything if there's no application or user is already a host
  if (loading || !application || user.role === 'HOST' || user.role === 'SUPER_ADMIN') {
    return null;
  }

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/50',
      title: 'Application Under Review',
      message: 'Your host application is currently being reviewed. We\'ll notify you once a decision has been made.'
    },
    APPROVED: {
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      title: 'Application Approved!',
      message: 'Congratulations! You are now a tournament host. Please log out and log back in to access your host features.'
    },
    REJECTED: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/50',
      title: 'Application Not Approved',
      message: 'Unfortunately, your application was not approved at this time. You may submit a new application after 30 days.'
    }
  };

  const status = statusConfig[application.status];
  const StatusIcon = status.icon;

  return (
    <Card className={`p-6 border ${status.borderColor}`}>
      <div className="flex items-start space-x-4">
        <div className={`${status.bgColor} p-2 rounded-lg`}>
          <StatusIcon className={`h-6 w-6 ${status.color}`} />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-2">Host Application Status</h2>
          <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color} mb-3`}>
            {status.title}
          </div>
          <p className="text-gray-300">
            {status.message}
          </p>
          {application.status === 'APPROVED' && (
            <p className="mt-2 text-sm text-gray-400">
              Application approved on {new Date(application.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ApplicationStatus;