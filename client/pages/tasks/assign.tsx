'use client'

import { useState, useEffect } from 'react'
import {
  TextInput,
  Select,
  Button,
  Textarea,
  Group,
  Container,
  Paper,
  Title,
  Text,
  Box,
  Stack,
  Badge,
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
    project: '',
  })

  useEffect(() => {
    const organisationId = localStorage.getItem('organisationId')

    const fetchData = async () => {
      try {
        const [employeesRes, projectsRes] = await Promise.all([
          axios.get(`/teammates/employees/${organisationId}`),
          axios.post(`/projects/get/${organisationId}`, { organisationId }),
        ])

        setEmployees(employeesRes.data?.data || [])
        setProjects(projectsRes.data?.data || [])
      } catch (error) {
        showNotification({
          title: 'Error',
          message: 'Failed to fetch data.',
          color: 'red',
        })
      }
    }

    if (organisationId) fetchData()
    else {
      showNotification({
        title: 'Error',
        message: 'Organisation ID not found.',
        color: 'red',
      })
    }
  }, [])

  const handleTaskCreate = async () => {
    try {
      await axios.post('/tasks/create', taskData)
      showNotification({
        title: 'Success',
        message: 'Task assigned successfully!',
        color: 'green',
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
      showNotification({
        title: 'Error',
        message: 'Failed to assign task.',
        color: 'red',
      })
    }
  }

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    const colors = {
      low: 'green',
      medium: 'yellow',
      high: 'red',
    }
    return colors[priority] || 'gray'
  }

  return (
    <Container size="md" px="lg">
      <Paper
        shadow="sm"
        radius="md"
        p="xl"
        sx={(theme) => ({
          backgroundColor:
            theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
          marginTop: Number(theme.spacing.xl) * 2,
        })}
      >
        <Stack spacing="lg">
          <Box>
            <Title
              order={2}
              sx={(theme) => ({
                color:
                  theme.colorScheme === 'dark'
                    ? theme.white
                    : theme.colors.dark[7],
                marginBottom: theme.spacing.xs,
              })}
            >
              Create New Task
            </Title>
            <Text color="dimmed" size="sm">
              Assign tasks to team members and track project progress
            </Text>
          </Box>

          <TextInput
            label="Task Title"
            placeholder="Enter a descriptive title"
            value={taskData.title}
            onChange={(e) =>
              setTaskData({ ...taskData, title: e.target.value })
            }
            required
            sx={{ width: '100%' }}
          />

          <Textarea
            label="Description"
            placeholder="Provide detailed task description..."
            minRows={4}
            value={taskData.description}
            onChange={(e) =>
              setTaskData({ ...taskData, description: e.target.value })
            }
            required
            sx={(theme) => ({
              '.mantine-Textarea-input': {
                minHeight: '120px',
              },
            })}
          />

          <Select
            label="Project"
            placeholder="Select project"
            value={taskData.project}
            onChange={(value) =>
              setTaskData({ ...taskData, project: value || '' })
            }
            data={projects.map((project) => ({
              value: project._id.toString(),
              label: project.name,
            }))}
            required
            searchable
            clearable
            sx={{ width: '100%' }}
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
            data={[
              { value: 'low', label: 'Low Priority' },
              { value: 'medium', label: 'Medium Priority' },
              { value: 'high', label: 'High Priority' },
            ]}
            required
            sx={{ width: '100%' }}
            itemComponent={({ value, label }) => (
              <Group spacing="xs">
                <Badge
                  color={getPriorityColor(value)}
                  size="sm"
                  variant="filled"
                >
                  {value.toUpperCase()}
                </Badge>
                <Text size="sm">{label}</Text>
              </Group>
            )}
          />

          <TextInput
            label="Due Date"
            type="date"
            value={taskData.dueDate}
            onChange={(e) =>
              setTaskData({ ...taskData, dueDate: e.target.value })
            }
            required
            sx={{ width: '100%' }}
          />

          <MultiSelect
            label="Assign To"
            data={employees}
            value={taskData.assignedTo}
            onChange={(selected) =>
              setTaskData({ ...taskData, assignedTo: selected })
            }
          />

          <Group position="right" mt="xl">
            <Button
              onClick={handleTaskCreate}
              size="md"
              sx={(theme) => ({
                minWidth: '150px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows.md,
                },
              })}
            >
              Create Task
            </Button>
          </Group>
        </Stack>
      </Paper>
    </Container>
  )
}

export default TaskAssignPage
