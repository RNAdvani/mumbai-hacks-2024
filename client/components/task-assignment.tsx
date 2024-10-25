import React from 'react';
import {
  Grid,
  Paper,
  Text,
  Avatar,
  Group,
  Badge,
  ActionIcon,
  Menu,
  Progress,
  Stack,
  Card,
  Modal,
  Tabs,
  Timeline,
  ScrollArea,
  Button,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HiOutlineCalendar, 
  HiOutlineUsers, 
  HiOutlineTag,
  HiOutlineChatAlt,
  HiDotsVertical,
  HiPlus
} from 'react-icons/hi';
import axios from "../services/axios";

import { useDisclosure } from '@mantine/hooks';
import { useAppContext } from '../providers/app-provider';
import Input from './input';
import TagInputs from './tags-input';
import { Project, Task } from '../types';

const ProjectDashboard = () => {
  const [opened, { open, close }] = useDisclosure(false);
  const [taskModal, { open: openTask, close: closeTask }] = useDisclosure(false);
  const { theme, socket, organisationId, userId } = useAppContext();
  const queryClient = useQueryClient();

  const projectForm = useForm({
    initialValues: {
      name: '',
      description: '',
      startDate: null,
      endDate: null,
      team: [],
      tags: [],
      priority: 'medium',
      status: 'planning'
    }
  });

  const taskForm = useForm({
    initialValues: {
      title: '',
      description: '',
      assignedTo: [],
      dueDate: null,
      priority: 'medium',
      estimatedHours: 0
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: (data) => axios.post('/api/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      notifications.show({
        title: 'Success',
        message: 'Project created successfully',
        color: 'green'
      });
      close();
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data) => axios.post('/api/tasks', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['tasks']);
      socket.emit('task:created', {
        taskId: data.data._id,
        assignedTo: taskForm.values.assignedTo
      });
      notifications.show({
        title: 'Success',
        message: 'Task created successfully',
        color: 'green'
      });
      closeTask();
    }
  });

  const [projects, setProjects] = React.useState<Project[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);

  React.useEffect(() => {
    if (socket) {
      socket.on('task:assigned', (data) => {
        if (data.assignedTo.includes(userId)) {
          notifications.show({
            title: 'New Task Assigned',
            message: `You have been assigned to task: ${data.taskTitle}`,
            color: 'blue'
          });
        }
      });
    }
  }, [socket, userId]);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Create New Project"
        size="lg"
        padding="xl"
      >
        <form onSubmit={projectForm.onSubmit((values) => 
          createProjectMutation.mutate({ ...values, organisationId:organisationId! })
        )}>
          <Stack spacing="md">
            <Input
              label="Project Name"
              placeholder="Enter project name"
              {...projectForm.getInputProps('name')}
            />
            <Input
              label="Description"
              placeholder="Project description"
              {...projectForm.getInputProps('description')}
            />
            <Group grow>
              <DatePicker
                label="Start Date"
                placeholder="Pick a date"
                {...projectForm.getInputProps('startDate')}
              />
              <DatePicker
                label="End Date"
                placeholder="Pick a date"
                {...projectForm.getInputProps('endDate')}
              />
            </Group>
            <TagInputs
              label="Team Members"
              placeholder="Add team members"
              onValueChange={(val) => projectForm.setFieldValue('team', val)}
            />
            <Button 
              loading={createProjectMutation.isLoading}
              type="submit"
            >
              Create Project
            </Button>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={taskModal}
        onClose={closeTask}
        title="Create New Task"
        size="lg"
        padding="xl"
      >
        <form onSubmit={taskForm.onSubmit((values) => 
          createTaskMutation.mutate({ ...values, project: selectedProject })
        )}>
          <Stack spacing="md">
            <Input
              label="Task Title"
              placeholder="Enter task title"
              {...taskForm.getInputProps('title')}
            />
            <Input
              label="Description"
              placeholder="Task description"
              {...taskForm.getInputProps('description')}
            />
            <TagInputs
              label="Assign To"
              placeholder="Assign team members"
              onValueChange={(val) => taskForm.setFieldValue('assignedTo', val)}
            />
            <Group grow>
              <DatePicker
                label="Due Date"
                placeholder="Pick a date"
                {...taskForm.getInputProps('dueDate')}
              />
              <Input
                type="number"
                label="Estimated Hours"
                placeholder="Enter hours"
                {...taskForm.getInputProps('estimatedHours')}
              />
            </Group>
            <Button 
              loading={createTaskMutation.isLoading}
              type="submit"
            >
              Create Task
            </Button>
          </Stack>
        </form>
      </Modal>

      <Grid>
        <Grid.Col span={12}>
          <Group position="apart" mb="lg">
            <Text size="xl" weight={600}>Projects</Text>
            <Button leftIcon={<HiPlus />} onClick={open}>
              New Project
            </Button>
          </Group>
        </Grid.Col>

        <Grid.Col span={12}>
          <Tabs defaultValue="active">
            <Tabs.List>
              <Tabs.Tab value="active">Active Projects</Tabs.Tab>
              <Tabs.Tab value="completed">Completed</Tabs.Tab>
              <Tabs.Tab value="planning">Planning</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="active" pt="xl">
              <Grid>
                {projects?.map((project) => (
                  <Grid.Col span={4} key={project._id}>
                    <ProjectCard 
                      project={project}
                      onCreateTask={() => {
                        setSelectedProject(project._id);
                        openTask();
                      }}
                    />
                  </Grid.Col>
                ))}
              </Grid>
            </Tabs.Panel>
          </Tabs>
        </Grid.Col>
      </Grid>
    </>
  );
};

const ProjectCard = ({ project, onCreateTask }) => {
  const theme = useMantineTheme();
  
  return (
    <Card shadow="sm" p="lg">
      <Group position="apart" mb="md">
        <Text weight={500}>{project.name}</Text>
        <Menu>
          <Menu.Target>
            <ActionIcon>
              <HiDotsVertical />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item icon={<HiPlus />} onClick={onCreateTask}>
              Add Task
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>

      <Text size="sm" color="dimmed" mb="md">
        {project.description}
      </Text>

      <Group spacing="xs" mb="md">
        <Badge 
          color={
            project.priority === 'high' ? 'red' : 
            project.priority === 'medium' ? 'yellow' : 
            'green'
          }
        >
          {project.priority}
        </Badge>
        <Badge>{project.status}</Badge>
      </Group>

      <Progress 
        value={project.progress} 
        label={`${project.progress}%`}
        size="xl" 
        radius="xl" 
        mb="md"
      />

      <Group position="apart" mt="md">
        <Avatar.Group spacing="sm">
          {project.team.map((member) => (
            <Avatar
              key={member._id}
              src={`/avatars/${member.username[0].toLowerCase()}.png`}
              radius="xl"
            />
          ))}
        </Avatar.Group>
        <Text size="sm" color="dimmed">
          Due {new Date(project.endDate).toLocaleDateString()}
        </Text>
      </Group>
    </Card>
  );
};

const TaskList = ({ projectId }) => {
  const [commentModal, { open: openComment, close: closeComment }] = useDisclosure(false);
  const [selectedTask, setSelectedTask] = React.useState(null);
  const { socket, userId } = useAppContext();

  const commentForm = useForm({
    initialValues: {
      content: ''
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (data) => axios.post(`/api/tasks/${selectedTask}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks', projectId]);
      socket.emit('task:commented', {
        taskId: selectedTask,
        userId: userId
      });
      closeComment();
    }
  });

  React.useEffect(() => {
    if (socket) {
      socket.on('task:comment_added', (data) => {
        if (data.task.assignedTo.includes(userId)) {
          notifications.show({
            title: 'New Comment',
            message: `New comment added to task: ${data.task.title}`,
            color: 'blue'
          });
        }
      });
    }
  }, [socket, userId]);

  return (
    <>
      <Modal
        opened={commentModal}
        onClose={closeComment}
        title="Add Comment"
        size="md"
      >
        <form onSubmit={commentForm.onSubmit((values) => 
          addCommentMutation.mutate(values)
        )}>
          <Stack>
            <Input
              multiline
              rows={3}
              placeholder="Write your comment..."
              {...commentForm.getInputProps('content')}
            />
            <Button type="submit" loading={addCommentMutation.isLoading}>
              Add Comment
            </Button>
          </Stack>
        </form>
      </Modal>

      <ScrollArea h={600}>
        <Timeline active={1} bulletSize={24} lineWidth={2}>
          {tasks?.map((task) => (
            <Timeline.Item
              key={task._id}
              bullet={<Avatar size={24} />}
              title={
                <Group position="apart">
                  <Text>{task.title}</Text>
                  <Menu>
                    <Menu.Target>
                      <ActionIcon>
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item 
                        icon={<HiOutlineChatAlt />}
                        onClick={() => {
                          setSelectedTask(task._id);
                          openComment();
                        }}
                      >
                        Add Comment
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              }
            >
              <Text color="dimmed" size="sm">{task.description}</Text>
              <Group mt="xs">
                <Badge size="sm">{task.priority}</Badge>
                <Text size="xs">{task.estimatedHours}h</Text>
              </Group>
              {task.comments?.length > 0 && (
                <Paper withBorder p="xs" mt="xs">
                  <Text size="xs" weight={500} mb="xs">
                    Latest Comments
                  </Text>
                  {task.comments.map((comment) => (
                    <Group key={comment._id} mb="xs">
                      <Avatar 
                        size="sm"
                        src={`/avatars/${comment.user.username[0].toLowerCase()}.png`}
                      />
                      <div>
                        <Text size="xs" weight={500}>
                          {comment.user.username}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {comment.content}
                        </Text>
                      </div>
                    </Group>
                  ))}
                </Paper>
              )}
            </Timeline.Item>
          ))}
        </Timeline>
      </ScrollArea>
    </>
  );
};

export default ProjectDashboard;