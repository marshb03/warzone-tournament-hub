import React from 'react';

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants = {
    primary: 'bg-[#2979FF] hover:bg-[#2979FF]/90 text-white focus:ring-[#2979FF]/50',
    secondary: 'bg-[#1A237E] hover:bg-[#1A237E]/90 text-white focus:ring-[#1A237E]/50',
    accent: 'bg-[#00E676] hover:bg-[#00E676]/90 text-black focus:ring-[#00E676]/50',
    ghost: 'bg-transparent hover:bg-white/10 text-white'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;