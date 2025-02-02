// src/components/auth/PasswordRequirements.jsx
import React from 'react';
import { Check, X } from 'lucide-react';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { 
      label: 'At least 8 characters', 
      test: (pass) => pass.length >= 8,
      description: 'Password must be at least 8 characters long'
    },
    { 
      label: 'At least one uppercase letter', 
      test: (pass) => /[A-Z]/.test(pass),
      description: 'Include at least one uppercase letter (A-Z)'
    },
    { 
      label: 'At least one lowercase letter', 
      test: (pass) => /[a-z]/.test(pass),
      description: 'Include at least one lowercase letter (a-z)'
    },
    { 
      label: 'At least one number', 
      test: (pass) => /\d/.test(pass),
      description: 'Include at least one number (0-9)'
    },
    { 
      label: 'At least one special character', 
      test: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      description: 'Include at least one special character (!@#$%^&*)'
    }
  ];

  return (
    <div className="rounded-lg bg-gray-800/50 p-4 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Password Requirements</h3>
      <ul className="space-y-2">
        {requirements.map((req, index) => {
          const isMet = req.test(password);
          return (
            <li 
              key={index} 
              className={`flex items-center text-sm transition-colors duration-200 ${
                isMet ? 'text-green-400' : 'text-gray-400'
              }`}
            >
              <div className="mr-2">
                {isMet ? (
                  <div className="rounded-full bg-green-500/10 p-1">
                    <Check className="h-3 w-3" />
                  </div>
                ) : (
                  <div className="rounded-full bg-gray-700/50 p-1">
                    <X className="h-3 w-3" />
                  </div>
                )}
              </div>
              <span className="text-xs">
                {req.label}
              </span>
              <div className="relative group">
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-xs text-gray-300 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-48 text-center pointer-events-none">
                  {req.description}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordRequirements;