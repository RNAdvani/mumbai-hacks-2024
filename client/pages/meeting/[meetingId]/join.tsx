import React from 'react';
import JoinMeeting from '../../../components/JoinMeeting';

export default function JoinMeetingPage() {
  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Join a Meeting</h2>
      <JoinMeeting />
    </div>
  );
}
