"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTask = exports.getTasks = exports.createTask = void 0;
const tslib_1 = require("tslib");
const task_1 = require("../models/task");
const TryCatch_1 = require("../helpers/TryCatch");
const errorResponse_1 = require("../middleware/errorResponse");
const project_1 = require("../models/project");
exports.createTask = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { title, description, project, assignedTo, status, priority, dueDate, startDate, estimatedHours, dependencies, subtasks, progress, tags } = req.body;
    console.log(req.user);
    const projectFound = yield project_1.Project.findById(project);
    if (!projectFound) {
        return next(new errorResponse_1.ErrorHandler(404, 'Project not found'));
    }
    // Validate project and user IDs
    const task = yield task_1.Task.create({
        title,
        description,
        project: projectFound._id,
        assignedTo,
        assignedBy: req.user.id,
        status,
        priority,
        progress,
        dueDate: new Date(dueDate),
        startDate: startDate ? new Date(startDate) : undefined,
        estimatedHours,
        dependencies,
        subtasks,
        tags
    });
    yield task.populate([
        { path: 'assignedTo', select: 'name email' },
        { path: 'assignedBy', select: 'name email' },
        { path: 'project', select: 'name' },
        { path: 'dependencies', select: 'title' }
    ]);
    res.status(201).json({
        success: true,
        task
    });
}));
exports.getTasks = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { projectId } = req.body;
    if (!projectId) {
        return next(new errorResponse_1.ErrorHandler(400, 'Please provide a project ID'));
    }
    const tasks = yield task_1.Task.find({ project: projectId });
    res.status(200).json({
        success: true,
        tasks
    });
}));
exports.updateTask = (0, TryCatch_1.TryCatch)((req, res, next) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { title, description, project, assignedTo, assignedBy, status, priority, dueDate, startDate, estimatedHours, dependencies, subtasks, tags, progress, taskId } = req.body;
    const task = yield task_1.Task.findById(taskId);
    if (!task) {
        return next(new errorResponse_1.ErrorHandler(404, 'Task not found'));
    }
    yield task_1.Task.findByIdAndUpdate({
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
    });
    res.status(200).json({
        success: true,
        message: 'Task updated successfully'
    });
}));
//# sourceMappingURL=tasks.js.map