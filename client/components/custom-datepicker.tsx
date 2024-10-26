// components/CustomDatePicker.tsx
import React from 'react';

interface CustomDatePickerProps {
  label: string;
  value: string; // ISO date string
  onChange: (date: Date | null) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ label, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      onChange(new Date(selectedDate));
    } else {
      onChange(null);
    }
  };

  return (
    <div>
      <label>
        {label}
        <input
          type="date"
          value={value ? value.split('T')[0] : ''} // Format value to YYYY-MM-DD
          onChange={handleChange}
        />
      </label>
    </div>
  );
};

export default CustomDatePicker;
