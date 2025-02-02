// src/pages/auth/EmailVerification.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Card from '../../components/ui/Card';
import { authService } from '../../services/auth';

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await authService.verifyEmail(token);
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message);
          // Redirect to login after 3 seconds on success
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(response.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
              <h2 className="mt-4 text-2xl font-bold text-white">Verifying your email...</h2>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
              <p className="text-gray-400">{message}</p>
              <p className="text-gray-400 mt-4">Redirecting to login...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-500/10 mb-4">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#2979FF] hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2979FF] focus:ring-offset-gray-900 transition-colors"
              >
                Back to Login
              </button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmailVerification;