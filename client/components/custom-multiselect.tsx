import React, { useState } from 'react';
import { User } from '../types';


interface MultiSelectProps {
  label: string;
  data: User[];
  value: User[];
  onChange: (selected: User[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, data, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<User[]>(value);

  const toggleUser = (user: User) => {
    const isSelected = selectedUsers.find((u) => u._id === user._id);
    const updatedSelection = isSelected
      ? selectedUsers.filter((u) => u._id !== user._id)
      : [...selectedUsers, user];

    setSelectedUsers(updatedSelection);
    onChange(updatedSelection); // Update parent component's state
  };

  return (
    <div style={{ position: 'relative', width: '300px' }}>
      <label>{label}</label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '5px',
        }}
      >
        {selectedUsers?.map((user) => (
          <span
            key={user?._id.toString()}
            style={{
              padding: '4px 8px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            {user.username} <button onClick={(e) => { e.stopPropagation(); toggleUser(user); }}>×</button>
          </span>
        ))}
      </div>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            width: '100%',
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: '#fff',
            zIndex: 1,
          }}
        >
          {data?.map((user) => (
            <div
              key={user?._id.toString()}
              onClick={() => toggleUser(user)}
              style={{
                padding: '8px',
                cursor: 'pointer',
                backgroundColor: selectedUsers.some((u) => u._id === user._id) ? '#f0f0f0' : 'transparent',
              }}
            >
              {user?.username} - {user.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
