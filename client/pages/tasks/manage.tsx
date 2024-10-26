import { useState, useEffect } from 'react';
import { Table, Button, Container, Modal, TextInput, Textarea, Group } from '@mantine/core';
import axios from 'axios';
import { showNotification } from '@mantine/notifications';

const TaskManagementPage = () => {
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState<any>(null);

  useEffect(() => {
    // Fetch tasks
    axios.get('/api/tasks').then(response => setTasks(response.data));
  }, []);

  const handleEditTask = (task: any) => setEditTask(task);

  const handleSaveTask = async () => {
    try {
      await axios.put(`/api/tasks/${editTask._id}`, editTask);
      setEditTask(null);
      showNotification({ title: 'Success', message: 'Task updated successfully!' });
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to update task.' });
    }
  };

  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task: any) => (
            <tr key={task._id}>
              <td>{task.title}</td>
              <td>{task.priority}</td>
              <td>{task.status}</td>
              <td>
                <Button onClick={() => handleEditTask(task)}>Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal opened={!!editTask} onClose={() => setEditTask(null)} title="Edit Task">
        <TextInput
          label="Title"
          value={editTask?.title || ''}
          onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
        />
        <Textarea
          label="Description"
          value={editTask?.description || ''}
          onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
        />
        <Group position="right">
          <Button onClick={handleSaveTask}>Save</Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default TaskManagementPage;
