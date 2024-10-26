import React, { useState } from 'react'
import { Plus, X, Edit2, Check } from 'lucide-react'

type Task = {
  id: number
  text: string
}

type Column = {
  id: number
  title: string
  tasks: Task[]
}

const initialColumns: Column[] = [
  {
    id: 1,
    title: 'To Do',
    tasks: [
      { id: 1, text: 'Task 1' },
      { id: 2, text: 'Task 2' },
    ],
  },
  {
    id: 2,
    title: 'In Progress',
    tasks: [],
  },
  {
    id: 3,
    title: 'Done',
    tasks: [],
  },
]

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState('')
  const [editingTask, setEditingTask] = useState<{
    id: number
    text: string
  } | null>(null)
  const [draggedOverColumn, setDraggedOverColumn] = useState<number | null>(
    null
  )

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
    if (draggedTask) {
      setColumns((prevColumns) =>
        prevColumns.map((column) => {
          if (column.id === columnId) {
            return { ...column, tasks: [...column.tasks, draggedTask] }
          }
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== draggedTask.id),
          }
        })
      )
      setDraggedTask(null)
      setDraggedOverColumn(null)
    }
  }

  const addTask = (columnId: number) => {
    if (newTask.trim()) {
      const newTaskObj = {
        id:
          Math.max(...columns.flatMap((col) => col.tasks.map((t) => t.id)), 0) +
          1,
        text: newTask.trim(),
      }

      setColumns((prevColumns) =>
        prevColumns.map((column) =>
          column.id === columnId
            ? { ...column, tasks: [...column.tasks, newTaskObj] }
            : column
        )
      )
      setNewTask('')
    }
  }

  const deleteTask = (taskId: number) => {
    setColumns((prevColumns) =>
      prevColumns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      }))
    )
  }

  const startEditingTask = (task: Task) => {
    setEditingTask({ id: task.id, text: task.text })
  }

  const updateTask = () => {
    if (editingTask) {
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
      setEditingTask(null)
    }
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
          <h2 className="text-xl font-bold mb-4 text-blue-400">
            {column.title}
          </h2>

          <div className="flex mb-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-3 py-2 bg-[#404146] text-white rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New task..."
            />
            <button
              onClick={() => addTask(column.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="flex-1 space-y-2">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => onDragStart(task)}
                className="bg-gray-700 p-3 rounded-md group flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-gray-600 transition-colors"
              >
                {editingTask?.id === task.id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTask.text}
                      onChange={(e) =>
                        setEditingTask({ ...editingTask, text: e.target.value })
                      }
                      className="flex-1 px-2 py-1 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <span className="text-white flex-1">{task.text}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditingTask(task)}
                        className="p-1 text-blue-400 hover:text-blue-300"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X size={16} />
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
