// src/components/backgrounds/FloatingIcons.jsx
import React from 'react';
import { 
  Gamepad, 
  Sword, 
  Trophy, 
  Target, 
  Medal,
  Crown,
  Swords,
  Crosshair,
  Shield,
  Flag,
  Zap,
  Star,
  Flame
} from 'lucide-react';

const FloatingIcon = ({ Icon, style }) => (
  <div 
    className="absolute transform"
    style={{
      ...style,
      animation: `float ${10 + Math.random() * 10}s ease-in-out infinite`,
      animationDelay: `${Math.random() * 5}s`
    }}
  >
    <Icon 
      size={Math.floor(32 + Math.random() * 32)}
      className="text-white opacity-[0.035]"
    />
  </div>
);

const icons = [
  Gamepad,
  Sword,
  Trophy,
  Target,
  Medal,
  Crown,
  Swords,
  Crosshair,
  Shield,
  Flag,
  Zap,
  Star,
  Flame
];

const FloatingIcons = () => {
  // Function to generate icon positions for each section
  const generateSectionIcons = (yStart, yEnd, count) => {
    return Array(count).fill(null).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${yStart + Math.random() * (yEnd - yStart)}%`,
      transform: `rotate(${Math.random() * 360}deg)`
    }));
  };

  // Generate icons for different sections of the page
  const sections = [
    { start: 0, end: 25, count: 15 },    // Hero section
    { start: 25, end: 50, count: 15 },   // Middle section
    { start: 50, end: 75, count: 15 },   // Lower middle section
    { start: 75, end: 100, count: 15 }   // Bottom section
  ];

  return (
    <div 
      className="absolute top-0 left-0 w-full h-full"  // Changed from fixed to absolute
      style={{ 
        background: 'linear-gradient(180deg, #1A237E 0%, #046fcc 100%)',
        minHeight: '100%'
      }}
    >
      {sections.map((section, sectionIndex) => 
        generateSectionIcons(section.start, section.end, section.count).map((position, index) => (
          <FloatingIcon 
            key={`section-${sectionIndex}-icon-${index}`}
            Icon={icons[(sectionIndex * section.count + index) % icons.length]}
            style={position}
          />
        ))
      )}
    </div>
  );
};

const FloatingIconsWrapper = ({ children }) => (
  <div className="relative flex-grow">
    <FloatingIcons />
    <div className="relative z-10">
      {children}
    </div>
  </div>
);

export { FloatingIcons as default, FloatingIconsWrapper };