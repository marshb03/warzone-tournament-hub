// src/components/auth/PasswordRequirements.jsx
import React from 'react';
import { Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: 'At least 8 characters', test: (pass) => pass.length >= 8 },
    { label: 'At least one uppercase letter', test: (pass) => /[A-Z]/.test(pass) },
    { label: 'At least one lowercase letter', test: (pass) => /[a-z]/.test(pass) },
    { label: 'At least one number', test: (pass) => /\d/.test(pass) },
    { label: 'At least one special character', test: (pass) => /[!@#$%^&*(),.?":{}|<>]/.test(pass) }
  ];

  const iconVariants = {
    checked: { scale: 1, opacity: 1 },
    unchecked: { scale: 0.8, opacity: 0.8 }
  };

  const listItemVariants = {
    checked: { 
      color: '#059669', // text-green-600
      transition: { duration: 0.2 } 
    },
    unchecked: { 
      color: '#4B5563', // text-gray-600
      transition: { duration: 0.2 } 
    }
  };

  return (
    <div className="rounded-md bg-gray-50 p-4 transition-all duration-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Password Requirements</h3>
      <ul className="space-y-2">
        {requirements.map((req, index) => {
          const isChecked = req.test(password);
          return (
            <motion.li
              key={index}
              className="flex items-center text-sm"
              initial="unchecked"
              animate={isChecked ? "checked" : "unchecked"}
              variants={listItemVariants}
            >
              <motion.div
                variants={iconVariants}
                className="mr-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {isChecked ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )}
              </motion.div>
              <span>{req.label}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
};

export default PasswordRequirements;