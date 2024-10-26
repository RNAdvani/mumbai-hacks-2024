import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Container, Text, Textarea, Button, List, Group } from '@mantine/core';
import axios from 'axios';
import { showNotification } from '@mantine/notifications';

const TaskDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [task, setTask] = useState<any>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      axios.get(`/api/tasks/${id}`).then(response => setTask(response.data));
    }
  }, [id]);

  const handleAddComment = async () => {
    try {
      await axios.post(`/api/tasks/${id}/comments`, { content: comment });
      setComment('');
      // Refresh task details
      const updatedTask = await axios.get(`/api/tasks/${id}`);
      setTask(updatedTask.data);
    } catch (error) {
      showNotification({ title: 'Error', message: 'Failed to add comment.' });
    }
  };

  return (
    <Container>
      {task ? (
        <>
          <Text size="xl">{task.title}</Text>
          <Text>{task.description}</Text>

          <List>
            {task.comments.map((c: any, index: number) => (
              <List.Item key={index}>{c.user.username}: {c.content}</List.Item>
            ))}
          </List>

          <Textarea
            placeholder="Add a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Group position="right">
            <Button onClick={handleAddComment}>Add Comment</Button>
          </Group>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </Container>
  );
};

export default TaskDetailPage;
