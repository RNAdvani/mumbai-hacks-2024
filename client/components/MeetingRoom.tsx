import dynamic from 'next/dynamic'

const ZegoCloudRoom = dynamic(() => import('./ZegoCloudRoom'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-xl">Loading meeting room...</div>
    </div>
  ),
})

interface MeetingRoomProps {
  meetingId: string
  userName?: string
  role?: number
  token?: string
}

const MeetingRoom: React.FC<MeetingRoomProps> = (props) => {
  return (
    <div className="h-screen w-full bg-gray-900">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">
          Meeting Room: {props.meetingId}
        </h1>
      </div>
      <div className="h-[calc(100vh-100px)]">
        <ZegoCloudRoom {...props} />
      </div>
    </div>
  )
}

export default MeetingRoom
