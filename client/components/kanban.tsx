import React, { useState, useEffect } from 'react'
import { Plus, X, Edit2, Check, User } from 'lucide-react'

type Task = {
  id: number
  text: string
  assignedTo: string
  status: 'todo' | 'inProgress' | 'done'
  createdAt: string
}

type Column = {
  id: number
  title: string
  status: 'todo' | 'inProgress' | 'done'
  tasks: Task[]
}

const initialColumns: Column[] = [
  {
    id: 1,
    title: 'To Do',
    status: 'todo',
    tasks: [],
  },
  {
    id: 2,
    title: 'In Progress',
    status: 'inProgress',
    tasks: [],
  },
  {
    id: 3,
    title: 'Done',
    status: 'done',
    tasks: [],
  },
]

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [editingTask, setEditingTask] = useState<{
    id: number
    text: string
  } | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<number | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch tasks from backend
  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/tasks') // Replace with your API endpoint
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const tasks: Task[] = await response.json()

      // Distribute tasks to appropriate columns
      const updatedColumns = initialColumns.map((column) => ({
        ...column,
        tasks: tasks.filter((task) => task.status === column.status),
      }))

      setColumns(updatedColumns)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  // Update task status in backend
  const updateTaskStatus = async (
    taskId: number,
    newStatus: 'todo' | 'inProgress' | 'done'
  ) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update task status')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update task status'
      )
      // Optionally refresh tasks to ensure UI is in sync with backend
      fetchTasks()
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchTasks()
  }, [])

  // Fetch tasks periodically (e.g., every 30 seconds)
  useEffect(() => {
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [])

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

  const onDrop = async (columnId: number) => {
    if (draggedTask) {
      const targetColumn = columns.find((col) => col.id === columnId)
      if (!targetColumn) return

      try {
        await updateTaskStatus(draggedTask.id, targetColumn.status)

        setColumns((prevColumns) =>
          prevColumns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: [
                  ...column.tasks,
                  { ...draggedTask, status: targetColumn.status },
                ],
              }
            }
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
            }
          })
        )
      } catch (err) {
        setError('Failed to move task. Please try again.')
      }

      setDraggedTask(null)
      setDraggedOverColumn(null)
    }
  }

  const updateTask = async () => {
    if (editingTask) {
      try {
        const response = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: editingTask.text }),
        })

        if (!response.ok) throw new Error('Failed to update task')

        setColumns((prevColumns) =>
          prevColumns.map((column) => ({
            ...column,
            tasks: column.tasks.map((task) =>
              task.id === editingTask.id
                ? { ...task, text: editingTask.text }
                : task
            ),
          }))
        )
      } catch (err) {
        setError('Failed to update task. Please try again.')
      }
      setEditingTask(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1B1E]">
        <div className="text-white">Loading tasks...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1A1B1E]">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 p-6 bg-[#1A1B1E] min-h-screen">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`flex-1 bg-[#27282c] rounded-lg p-4 flex flex-col ${
            draggedOverColumn === column.id ? 'border-2 border-blue-500' : ''
          }`}
          onDragOver={(e) => onDragOver(e, column.id)}
          onDragLeave={onDragLeave}
          onDrop={() => onDrop(column.id)}
        >
          <h2 className="text-xl font-bold mb-4 text-blue-400 flex items-center justify-between">
            {column.title}
            <span className="text-sm text-gray-400">
              {column.tasks.length}{' '}
              {column.tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </h2>

          <div className="flex-1 space-y-2">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task)}
                className="bg-[#404146] p-3 rounded-md group flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-[#4a4b50] transition-colors"
              >
                {editingTask?.id === task.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTask.text}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, text: e.target.value })
                      }
                      className="flex-1 px-2 py-1 bg-[#27282c] text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={updateTask}
                      className="p-1 text-green-400 hover:text-green-300"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col flex-1">
                      <span className="text-white">{task.text}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <User size={12} />
                        <span>{task.assignedTo}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          setEditingTask({ id: task.id, text: task.text })
                        }
                        className="p-1 text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </>
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
