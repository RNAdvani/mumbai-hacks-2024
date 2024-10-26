'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DefaultLayout from '../../../components/pages/default-layout'
import KanbanBoard from '../../../components/kanban'
import axios from '../../../services/axios'

export default function Conversation({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)

  const { projectId } = router.query

  const [tasks, setTasks] = useState([])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/tasks/get', { projectId })
      if (data.success) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (projectId) fetchTasks()
  }, [projectId])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('access-token')) {
        router.push('/signin')
      }
    }
  }, [])

  return (
    <DefaultLayout thread={children}>
      <div>
        {loading ? <div>Loading...</div> : <KanbanBoard tasks={tasks} />}
      </div>
    </DefaultLayout>
  )
}
