'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  X,
  Edit2,
  Check,
  Clock,
  User,
  Tag,
  MessageSquare,
  Paperclip,
} from 'lucide-react'
import { Task } from '../types'

type Column = {
  id: number
  title: string
  tasks: Task[]
}

const initialColumns: Column[] = [
  {
    id: 1,
    title: 'To Do',
    tasks: [] as Task[],
  },
  {
    id: 2,
    title: 'In Progress',
    tasks: [] as Task[],
  },
  {
    id: 3,
    title: 'Review',
    tasks: [] as Task[],
  },
  {
    id: 4,
    title: 'Completed',
    tasks: [] as Task[],
  },
]

const KanbanBoard = ({ tasks }: { tasks: Task[] }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<number | null>(
    null
  )

  // Distribute tasks to columns based on status
  useEffect(() => {
    const newColumns = initialColumns.map((column) => ({
      ...column,
      tasks: [] as Task[],
    }))

    tasks.forEach((task) => {
      console.log(`Task status: ${task.status}`) // Log the task status to verify
      switch (task.status) {
        case 'todo':
          newColumns[0].tasks.push(task)
          break
        case 'in-progress':
          newColumns[1].tasks.push(task)
          break
        case 'review':
          newColumns[2].tasks.push(task)
          break
        case 'completed':
          newColumns[3].tasks.push(task)
          break
        default:
          console.warn(`Unrecognized status: ${task.status}`) // Log if status does not match any case
      }
    })

    setColumns(newColumns)
  }, [tasks])

  const onDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: number) => {
    e.preventDefault()
    setDraggedOverColumn(columnId)
  }

  const onDragLeave = () => {
    setDraggedOverColumn(null)
  }

  const onDrop = (columnId: number) => {
    if (!draggedTask) return

    // Map column IDs to status
    const statusMap: { [key: number]: Task['status'] } = {
      1: 'todo',
      2: 'in-progress',
      3: 'review',
      4: 'completed',
    }

    const newStatus = statusMap[columnId]
    if (!newStatus) return

    // Update task status here
    // You'll need to implement this based on your data management approach
    console.log(`Task ${draggedTask.title} moved to ${newStatus}`)

    setDraggedTask(null)
    setDraggedOverColumn(null)
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="flex gap-6 p-6 bg-[#1A1B1E] min-h-screen overflow-x-auto">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`flex-1 min-w-[350px] bg-[#27282c] rounded-lg p-4 flex flex-col ${
            draggedOverColumn === column.id ? 'border-2 border-blue-500' : ''
          }`}
          onDragOver={(e) => onDragOver(e, column.id)}
          onDragLeave={onDragLeave}
          onDrop={() => onDrop(column.id)}
        >
          <h2 className="text-4xl text-center p-5 font-bold mb-4 text-blue-400">
            {column.title}
          </h2>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {column.tasks.map((task) => (
              <div
                key={task.title}
                draggable
                onDragStart={() => onDragStart(task)}
                className="bg-gray-700 p-4 rounded-md group flex flex-col gap-3 cursor-grab active:cursor-grabbing hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex-1">
                    {task.title}
                  </h3>
                  <div
                    className={`w-3 h-3 rounded-full ${getPriorityColor(
                      task.priority
                    )}`}
                  />
                </div>

                <p className="text-gray-300 text-sm line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center gap-4 text-gray-400 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{task.assignedTo.length}</span>
                  </div>
                  {task.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip size={14} />
                      <span>{task.attachments.length}</span>
                    </div>
                  )}
                  {task.comments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare size={14} />
                      <span>{task.comments.length}</span>
                    </div>
                  )}
                </div>

                {task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-600 text-xs text-gray-300 rounded-full flex items-center gap-1"
                      >
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {task.progress > 0 && (
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default KanbanBoard
