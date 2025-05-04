import React, { useState, useRef } from 'react';

export default function OctetInputGroup({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
}) {
    const splitIP = (ip: string = ''): string[] => {
        const parts = ip.split('.');
        return Array(4).fill('').map((_, i) => parts[i] || '');
      };
      
    const joinIP = (parts: string[]): string =>
    parts.map(part => part.trim()).join('.');
        
    const parts = splitIP(value);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const handleOctetChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^\d]/g, '').slice(0, 3); // Allow only 3 digits
    if (cleaned && parseInt(cleaned) > 255) return; // Prevent > 255
    const newParts = [...parts];
    newParts[index] = cleaned;
    onChange(joinIP(newParts));

    if ((cleaned.length === 3 || val.endsWith('.')) && index < 3) {
        inputsRef.current[index + 1]?.focus();
    }
    };

  return (
    <div className="octet-group">
      <label>{label}</label>
      <div className="octets">
        {parts.map((part, idx) => (
          <input
            key={idx}
            type="text"
            value={part}
            onChange={(e) => handleOctetChange(idx, e.target.value)}
            ref={(el) => (inputsRef.current[idx] = el)}
            className="octet"
            inputMode="numeric"
            maxLength={3}
          />
        ))}
      </div>
    </div>
  );
}
