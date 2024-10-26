import React from 'react'
import Link from 'next/link'

export default function MeetingDashboard() {
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Meeting Dashboard</h1>
      <Link
        href="/meetings/create"
        className="block mb-4 text-blue-600 hover:underline"
      >
        Create a Meeting
      </Link>
      <Link
        href="/meetings/join"
        className="block mb-4 text-blue-600 hover:underline"
      >
        Join a Meeting
      </Link>
    </div>
  )
}
