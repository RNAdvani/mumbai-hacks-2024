import { Task } from "../models/task";
import { TryCatch } from "../helpers/TryCatch";
import { ErrorHandler } from "../middleware/errorResponse";
import { Project } from "../models/project";

export const createTask = TryCatch(async (req, res, next) => {
    const {
        title,
        description,
        project,
        assignedTo,
        status,
        priority,
        dueDate,
        startDate,
        estimatedHours,
        dependencies,
        subtasks,
        progress,
        tags
      } = req.body

      console.log(req.user)

      const projectFound = await Project.findById(project)

        if (!projectFound) {
            return next(new ErrorHandler(404, 'Project not found'))
        }
  
      // Validate project and user IDs

  
      const task = await Task.create({
        title,
        description,
        project: projectFound._id,
        assignedTo,
        assignedBy:req.user.id,
        status,
        priority,
        progress,
        dueDate: new Date(dueDate),
        startDate: startDate ? new Date(startDate) : undefined,
        estimatedHours,
        dependencies,
        subtasks,
        tags
      })
  
      await task.populate([
        { path: 'assignedTo', select: 'name email' },
        { path: 'assignedBy', select: 'name email' },
        { path: 'project', select: 'name' },
        { path: 'dependencies', select: 'title' }
      ])
  
      res.status(201).json({
        success: true,
        task
      })

    })

export const getTasks = TryCatch(async (req, res, next) => {
    const { projectId } = req.body
    if (!projectId) {
      return next(new ErrorHandler(400, 'Please provide a project ID'))
    }
  
    const tasks = await Task.find({ project: projectId });

    res.status(200).json({
      success: true,
      tasks
    })
})

export const updateTask = TryCatch(async (req, res, next) => {
    const {
        title,
        description,
        project,
        assignedTo,
        assignedBy,
        status,
        priority,
        dueDate,
        startDate,
        estimatedHours,
        dependencies,
        subtasks,
        tags,
        progress,
        taskId
      } = req.body

      const task = await Task.findById(taskId)

        if (!task) {
            return next(new ErrorHandler(404, 'Task not found'))
        }

        await Task.findByIdAndUpdate({
            title,
            description,
            project,
            assignedTo,
            assignedBy,
            status,
            priority,
            progress,
            dueDate: new Date(dueDate),
            startDate: startDate ? new Date(startDate) : undefined,
            estimatedHours,
            dependencies,
            subtasks,
            tags
        })

        res.status(200).json({
            success: true,
            message: 'Task updated successfully'
        })
    })