// src/utils/validation.js
export const passwordValidation = {
    minLength: 8,
    hasUpperCase: /[A-Z]/,
    hasLowerCase: /[a-z]/,
    hasNumbers: /\d/,
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
  };
  
  export const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < passwordValidation.minLength) {
      errors.push(`Password must be at least ${passwordValidation.minLength} characters long`);
    }
    if (!passwordValidation.hasUpperCase.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!passwordValidation.hasLowerCase.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!passwordValidation.hasNumbers.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!passwordValidation.hasSpecialChar.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return errors;
  };