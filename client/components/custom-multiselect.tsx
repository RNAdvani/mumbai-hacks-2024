import React, { useState, useRef, useEffect } from 'react'
import { User } from '../types'
import { Search, X } from 'lucide-react'

interface MultiSelectProps {
  label: string
  data: User[]
  value: User[]
  onChange: (selected: User[]) => void
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  data,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<User[] | []>(value)
  const [searchTerm, setSearchTerm] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleUser = (user: User) => {
    const isSelected = selectedUsers.find((u) => u._id === user._id)
    const updatedSelection = isSelected
      ? selectedUsers.filter((u) => u._id !== user._id)
      : [...selectedUsers, user]

    setSelectedUsers(updatedSelection)
    onChange(updatedSelection)
  }

  const filteredUsers = data?.filter((user) =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] p-2 border border-gray-300 rounded-md cursor-pointer bg-white 
                  hover:border-blue-500 transition-colors duration-200 flex flex-wrap gap-2"
      >
        {selectedUsers.length === 0 && (
          <span className="text-gray-400 text-sm">Select users...</span>
        )}
        {selectedUsers?.map((user) => (
          <span
            key={user?._id.toString()}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 
                     rounded-md text-sm font-medium group"
          >
            {user.username}
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleUser(user)
              }}
              className="hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 
                      rounded-md shadow-lg z-50 max-h-[300px] flex flex-col overflow-hidden"
        >
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-md 
                         focus:outline-none focus:border-blue-500 transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              />
              <Search
                size={16}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-[250px]">
            {filteredUsers?.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No users found
              </div>
            ) : (
              filteredUsers?.map((user) => (
                <div
                  key={user?._id.toString()}
                  onClick={() => toggleUser(user)}
                  className={`
                    flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50
                    ${
                      selectedUsers.some((u) => u._id === user._id)
                        ? 'bg-blue-50'
                        : ''
                    }
                    ${
                      selectedUsers.some((u) => u._id === user._id)
                        ? 'text-blue-700'
                        : 'text-gray-700'
                    }
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.username}</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                  {selectedUsers.some((u) => u._id === user._id) && (
                    <span className="text-blue-600 text-sm font-medium">
                      Selected
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default MultiSelect
