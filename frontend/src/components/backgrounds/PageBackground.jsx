// src/components/layout/PageBackground.jsx
import React from 'react';
import { FloatingIconsWrapper } from '../backgrounds/FloatingIcons';

const PageBackground = ({ children }) => {
  return (
    <FloatingIconsWrapper>
      <div className="min-h-screen">
        {children}
      </div>
    </FloatingIconsWrapper>
  );
};

export default PageBackground;