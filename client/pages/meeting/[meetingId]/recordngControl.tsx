import React from 'react'
import { useRouter } from 'next/router'
import RecordingControl from '../../../components/Recording'
export default function RecordingControlPage() {
  const router = useRouter()
  const { meetingId } = router.query

  return meetingId ? (
    <RecordingControl meetingId={meetingId} />
  ) : (
    <p>Loading...</p>
  )
}
