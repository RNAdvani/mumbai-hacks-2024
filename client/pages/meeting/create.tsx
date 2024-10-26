  import React from 'react'
  import CreateMeeting from '../../components/CreateMeeting'

  export default function CreateMeetingPage() {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-1/3 p-10 bg-transparent rounded-2xl shadow-md">
          <h2 className="text-4xl font-bold mb-6">Create a Meeting</h2>
          <CreateMeeting />
        </div>
      </div>
    )
  }
