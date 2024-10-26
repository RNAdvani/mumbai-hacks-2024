'use client'

import React, { useState } from 'react'
import axios from '../services/axios'
// import { useRouter } from 'next/navigation'

const CreateMeeting = () => {
  const [meetingName, setMeetingName] = useState('')
  const [description, setDescription] = useState('')
  const [scheduledStartTime, setScheduledStartTime] = useState('')
  const [scheduledEndTime, setScheduledEndTime] = useState('')

  const handleCreateMeeting = async () => {
    // const router = useRouter()

    try {
      const res = await axios.post('http://localhost:8080/api/v1/meetings', {
        title: meetingName,
        description,
        scheduledStartTime,
        scheduledEndTime,
        participantIds: [], // Add participant IDs if needed
      })

      if (res.data.success) {
        window.location.href = `/meeting/${res.data.data._id}/join`
      }
    } catch (error) {
      console.error('Error creating meeting:', error)
      alert('Failed to create meeting.')
    }
  }

  return (
    <div className="flex flex-col">
      <input
        type="text"
        value={meetingName}
        onChange={(e) => setMeetingName(e.target.value)}
        placeholder="Enter meeting name"
        className="border border-gray-300 p-2 rounded mb-4"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Enter meeting description"
        className="border border-gray-300 p-2 rounded mb-4"
      />
      <input
        type="datetime-local"
        value={scheduledStartTime}
        onChange={(e) => setScheduledStartTime(e.target.value)}
        className="border border-gray-300 p-2 rounded mb-4"
      />
      <input
        type="datetime-local"
        value={scheduledEndTime}
        onChange={(e) => setScheduledEndTime(e.target.value)}
        className="border border-gray-300 p-2 rounded mb-4"
      />
      <button
        onClick={handleCreateMeeting}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Create Meeting
      </button>
    </div>
  )
}

export default CreateMeeting
