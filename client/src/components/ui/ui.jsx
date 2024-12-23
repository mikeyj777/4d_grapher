// ui.jsx
import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>
    {children}
  </div>
);

export const Slider = ({ value, onValueChange, min, max, step }) => {
  const handleChange = (e) => {
    onValueChange([parseFloat(e.target.value)]);
  };

  return (
    <div className="slider-container">
      <input
        type="range"
        className="slider"
        value={value[0]}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
      />
      <div className="slider-track"></div>
    </div>
  );
};

export const Label = ({ children, className = '' }) => (
  <label className={`label ${className}`}>
    {children}
  </label>
);

export const Section = ({ title, children, className = '' }) => (
  <div className={`section ${className}`}>
    <h3 className="section-title">{title}</h3>
    <div className="section-content">
      {children}
    </div>
  </div>
);