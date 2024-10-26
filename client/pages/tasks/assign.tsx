'use client'
import { useState, useEffect } from 'react'
import {
  TextInput,
  Select,
  Button,
  Textarea,
  Group,
  Container,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import axios from '../../services/axios'
import { useAppContext } from '../../providers/app-provider'
import MultiSelect from '../../components/custom-multiselect'
import { User, Project } from '../../types'

const TaskAssignPage = () => {
  const [employees, setEmployees] = useState<User[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    assignedTo: [] as User[],
    priority: 'medium',
    dueDate: '',
    project: '', // Project ID to be assigned
  })

  useEffect(() => {
    const organisationId = localStorage.getItem('organisationId')

    // Fetch employees and projects for selection
    const fetchData = async () => {
      try {
        const [employeesRes, projectsRes] = await Promise.all([
          axios.get(`/teammates/employees/${organisationId}`), // send org ID in body
          axios.post(`/projects/get/${organisationId}`, { organisationId }), // send org ID in body
        ])

        console.log(employeesRes.data?.data)
        console.log(projectsRes.data?.data)
        setEmployees(employeesRes.data?.data || [])
        setProjects(projectsRes.data?.data || [])
      } catch (error) {
        showNotification({ title: 'Error', message: 'Failed to fetch data.' })
      }
    }

    if (organisationId) fetchData()
    else {
      showNotification({
        title: 'Error',
        message: 'Organisation ID not found.',
      })
    }
  }, [])

  const handleTaskCreate = async () => {
    try {
      await axios.post('/tasks/create', taskData)
      showNotification({
        title: 'Success',
        message: 'Task assigned successfully!',
      })
      setTaskData({
        title: '',
        description: '',
        assignedTo: [],
        priority: 'medium',
        dueDate: '',
        project: '',
      })
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to assign task.' })
    }
  }

  return (
    <Container>
      <TextInput
        label="Task Title"
        value={taskData.title}
        onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
      />
      <Textarea
        label="Description"
        value={taskData.description}
        onChange={(e) =>
          setTaskData({ ...taskData, description: e.target.value })
        }
      />
      <Select
        label="Project"
        value={taskData.project}
        onChange={(value) => setTaskData({ ...taskData, project: value || '' })}
        data={projects.map((project) => ({
          value: project._id.toString(),
          label: project.name,
        }))}
        placeholder="Select a project"
      />
      <Select
        label="Priority"
        value={taskData.priority}
        onChange={(value) =>
          setTaskData({
            ...taskData,
            priority: value as 'low' | 'medium' | 'high',
          })
        }
        data={['low', 'medium', 'high']}
      />
      <TextInput
        label="Due Date"
        type="date"
        value={taskData.dueDate}
        onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
      />
      <MultiSelect
        label="Assign To"
        data={employees}
        value={taskData.assignedTo}
        onChange={(selected) =>
          setTaskData({ ...taskData, assignedTo: selected })
        }
      />
      <Group position="right">
        <Button onClick={handleTaskCreate}>Assign Task</Button>
      </Group>
    </Container>
  )
}

export default TaskAssignPage
