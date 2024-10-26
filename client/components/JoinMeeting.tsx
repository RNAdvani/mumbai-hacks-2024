import React, { useState } from 'react'
import axios from '../services/axios'
import { useRouter } from 'next/router'

const JoinMeeting = () => {
  const router = useRouter()
  const { meetingId } = router.query

  const handleJoinMeeting = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/v1/meetings/${meetingId}/join`
      )

      if (response.data.success) {
        // Handle successful join (e.g., redirect to meeting room with token and roomId)
        console.log('Meeting Details:', response.data.data) // Use this to navigate to the meeting
        window.location.href = `/meeting/${meetingId}`
      } else {
        alert(response.data.message)
      }
    } catch (error) {
      console.error('Error joining meeting:', error)
      alert('Failed to join meeting.')
    }
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={handleJoinMeeting}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Join Meeting
      </button>
    </div>
  )
}

export default JoinMeeting
