import React from 'react'
import CreateMeeting from '../../components/CreateMeeting'

export default function CreateMeetingPage() {
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Create a Meeting</h2>
      <CreateMeeting />
    </div>
  )
}
