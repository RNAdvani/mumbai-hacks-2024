"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: [true, 'Please enter task title'],
    },
    description: {
        type: String,
        required: [true, 'Please provide task description'],
    },
    project: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
    },
    assignedTo: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'User',
        }],
    assignedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'review', 'completed'],
        default: 'todo',
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium',
    },
    dueDate: {
        type: Date,
        required: true,
    },
    startDate: Date,
    estimatedHours: Number,
    actualHours: {
        type: Number,
        default: 0,
    },
    dependencies: [{
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Task',
        }],
    subtasks: [{
            title: String,
            completed: {
                type: Boolean,
                default: false,
            },
        }],
    attachments: [String],
    comments: [{
            user: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
            },
            content: String,
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    tags: [String],
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Task = mongoose_1.default.models.Task || mongoose_1.default.model('Task', taskSchema);
//# sourceMappingURL=task.js.map