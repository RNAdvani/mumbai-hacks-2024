import React from 'react'
import { useRouter } from 'next/router'
import MeetingRoom from '../../../components/MeetingRoom'

export default function MeetingRoomPage() {
  const router = useRouter()
  const { meetingId } = router.query

  if (!meetingId || typeof meetingId !== 'string') {
    return <div>Invalid meeting ID</div>
  }

  return <MeetingRoom meetingId={meetingId} userName="Test User" role={1} />
}
