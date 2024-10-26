import { useEffect, useRef } from 'react'
import Script from 'next/script'

interface ZegoCloudRoomProps {
  meetingId: string
  userName?: string
  role?: number
  token?: string
}

const ZegoCloudRoom: React.FC<ZegoCloudRoomProps> = ({
  meetingId,
  userName = 'User',
  role = 0,
  token,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window !== 'undefined' && containerRef.current) {
      const initZego = async () => {
        try {
          const { ZegoUIKitPrebuilt } = await import(
            '@zegocloud/zego-uikit-prebuilt'
          )

          const appID = process.env.NEXT_PUBLIC_ZEGO_APP_ID // Replace with your ZegoCloud App ID
          const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET! // Replace with your Server Secret

          const kitToken =
            token ||
            ZegoUIKitPrebuilt.generateKitTokenForTest(
              Number(appID),
              serverSecret,
              meetingId,
              Date.now().toString(),
              userName
            )

          const zp = ZegoUIKitPrebuilt.create(kitToken)

          zp.joinRoom({
            container: containerRef.current,
            sharedLinks: [
              {
                name: 'Meeting Link',
                url: window.location.href,
              },
            ],
            scenario: {
              mode: ZegoUIKitPrebuilt.GroupCall,
            },
            showScreenSharingButton: true,
            showPreJoinView: true,
            showLeavingView: true,
            turnOnMicrophoneWhenJoining: true,
            turnOnCameraWhenJoining: true,
            showUserList: true,
            showTextChat: true,
            showLayoutButton: true,
            maxUsers: 50,
            layout: 'Grid',
          })
        } catch (error) {
          console.error('Error initializing Zego:', error)
        }
      }

      initZego()
    }
  }, [meetingId, userName, token])

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ minHeight: '600px' }}
    />
  )
}

export default ZegoCloudRoom
