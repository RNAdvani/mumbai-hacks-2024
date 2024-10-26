import { useState, useEffect } from 'react'
import {
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Container,
} from '@mantine/core'
import { showNotification } from '@mantine/notifications'
import axios from '../../services/axios'
import MultiSelect from '../../components/custom-multiselect'
import { User } from '../../types'
import CustomDatePicker from '../../components/custom-datepicker'

const CreateProjectPage = () => {
  const [employees, setEmployees] = useState<User[]>([])
  const [projectData, setProjectData] = useState({
    organisationId: '',
    assignedEmployees: [] as User[],
    name: '',
    description: '',
    priority: 'medium',
    status: 'planning',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    projectData.organisationId = localStorage.getItem('organisationId')!
    // Fetch employees to assign to project
    axios
      .get(`/teammates/employees/${projectData.organisationId}`)
      .then((response) => {
        setEmployees(response.data?.data || [])
      })
  }, [projectData.organisationId])

  const handleProjectCreate = async () => {
    try {
      await axios.post('/projects/create', projectData)
      showNotification({
        title: 'Success',
        message: 'Project created successfully!',
      })
      setProjectData({
        ...projectData,
        name: '',
        description: '',
        assignedEmployees: [],
        startDate: '',
        endDate: '',
      })
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to create project.' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Container className="space-y-5 border-2 border-white bg-transparent p-7 rounded-2xl">
        <TextInput
          label="Project Name"
          value={projectData.name}
          onChange={(e) =>
            setProjectData({ ...projectData, name: e.target.value })
          }
        />
        <Textarea
          label="Description"
          value={projectData.description}
          onChange={(e) =>
            setProjectData({ ...projectData, description: e.target.value })
          }
        />
        <Select
          label="Priority"
          value={projectData.priority}
          onChange={(value) =>
            setProjectData({
              ...projectData,
              priority: value as 'low' | 'medium' | 'high',
            })
          }
          data={['low', 'medium', 'high']}
        />
        <Select
          label="Status"
          value={projectData.status}
          onChange={(value) =>
            setProjectData({
              ...projectData,
              status: value as 'todo' | 'in-progress' | 'review' | 'completed',
            })
          }
          data={['todo', 'in-progress', 'review', 'completed']}
        />
        <CustomDatePicker
          label="Start Date"
          value={projectData.startDate}
          onChange={(date: Date | null) =>
            setProjectData({
              ...projectData,
              startDate: date?.toISOString() || '',
            })
          }
        />
        <CustomDatePicker
          label="End Date"
          value={projectData.endDate}
          onChange={(date: Date | null) =>
            setProjectData({
              ...projectData,
              endDate: date?.toISOString() || '',
            })
          }
        />
        <MultiSelect
          label="Assign Employees"
          data={employees}
          value={projectData.assignedEmployees}
          onChange={(selected) =>
            setProjectData({ ...projectData, assignedEmployees: selected })
          }
        />
        <Group position="right">
          <Button onClick={handleProjectCreate}>Create Project</Button>
        </Group>
      </Container>
    </div>
  )
}

export default CreateProjectPage
