import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-white/10 rounded-lg shadow-lg overflow-hidden border border-[#2979FF]/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;