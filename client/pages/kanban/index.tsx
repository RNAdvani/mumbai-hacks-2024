import React from 'react'
import DefaultLayout from '../../components/pages/default-layout'
import { useAppContext } from '../../providers/app-provider'
import { useRouter } from 'next/router'
import KanbanBoard from '../../components/kanban'

export default function Conversation({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const {
    data: organisationData,
    channel,
    channelMessagesQuery,
    conversationMessagesQuery,
  } = useAppContext()

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('access-token')) {
        router.push('/signin')
      }
    }
  }, [])

  return (
    <DefaultLayout thread={children}>
      <KanbanBoard />
    </DefaultLayout>
  )
}
