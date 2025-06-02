import React, { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { SwatchIcon, ChevronLeftIcon } from '@heroicons/react/24/solid';

export const COLORS = [
  { value: 'var(--card-background)', label: 'Default', border: 'var(--divider)' },
  { value: '#FDE68A', label: 'Yellow', border: '#FCD34D' },
  { value: '#BBF7D0', label: 'Green', border: '#86EFAC' },
  { value: '#BFDBFE', label: 'Blue', border: '#93C5FD' },
  { value: '#DDD6FE', label: 'Purple', border: '#C4B5FD' },
  { value: '#FBCFE8', label: 'Pink', border: '#F9A8D4' },
  { value: '#FED7AA', label: 'Orange', border: '#FDBA74' },
  { value: '#E5E7EB', label: 'Gray', border: '#D1D5DB' },
];

interface ColorPickerProps {
  selectedColor: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

export default function ColorPicker({ selectedColor, onChange, onClose }: ColorPickerProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customColor, setCustomColor] = useState(selectedColor);

  const handleColorChange = (color: string) => {
    onChange(color);
    onClose();
  };

  const handleAdvancedColorChange = (color: string) => {
    setCustomColor(color);
  };

  const handleAdvancedColorSelect = () => {
    onChange(customColor);
    onClose();
  };

  if (showAdvanced) {
    return (
      <div className="bg-background rounded-lg shadow-lg border border-divider p-4 min-w-[280px]">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setShowAdvanced(false)}
            className="p-1 hover:bg-primary/10 rounded-full"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <h3 className="text-sm font-medium">Advanced Color Picker</h3>
        </div>
        <div className="space-y-4">
          <HexColorPicker color={customColor} onChange={handleAdvancedColorChange} />
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleAdvancedColorChange(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border rounded bg-card"
            />
            <button
              onClick={handleAdvancedColorSelect}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg shadow-lg border border-divider p-4 min-w-[280px]">
      <div className="grid grid-cols-4 gap-3">
        {COLORS.map((color) => (
          <button
            key={color.value}
            className="group relative flex flex-col items-center gap-1"
            onClick={() => handleColorChange(color.value)}
          >
            <div
              className="w-12 h-12 rounded-lg transition-transform group-hover:scale-110 border-2 relative"
              style={{
                backgroundColor: color.value,
                borderColor: selectedColor === color.value ? 'var(--color-primary)' : color.border,
              }}
            >
              {color.value === selectedColor && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              )}
            </div>
            <span className="text-xs opacity-60">{color.label}</span>
          </button>
        ))}
        <button
          className="group relative flex flex-col items-center gap-1"
          onClick={() => setShowAdvanced(true)}
        >
          <div className="w-12 h-12 rounded-lg transition-transform group-hover:scale-110 border-2 border-dashed border-divider flex items-center justify-center">
            <SwatchIcon className="w-6 h-6 opacity-40" />
          </div>
          <span className="text-xs opacity-60">Custom</span>
        </button>
      </div>
    </div>
  );
} 