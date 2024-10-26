import { useRouter } from 'next/router'
import React from 'react'
import DefaultLayout from '../../../components/pages/default-layout'
import KanbanBoard from '../../../components/kanban'


export default function Conversation({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

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
